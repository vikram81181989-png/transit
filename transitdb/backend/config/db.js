const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;
let dbReady = false;

// ✅ If DATABASE_URL exists → use it (production)
if (process.env.DATABASE_URL) {
  pool = mysql.createPool(process.env.DATABASE_URL);
}
// ✅ Otherwise → use local config (for your laptop)
else {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'transitdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+00:00',
  });
}

// Retry connection with exponential backoff (max ~60 s between retries)
function connectWithRetry(attempt) {
  pool.getConnection()
    .then(conn => {
      console.log('✅ MySQL connected');
      dbReady = true;
      conn.release();
      // Periodically re-verify the connection is still alive
      scheduleHealthCheck();
    })
    .catch(err => {
      dbReady = false;
      const delay = Math.min(1000 * Math.pow(2, attempt), 60000);
      console.error(`❌ MySQL connection failed: ${err.message} — retrying in ${delay / 1000}s`);
      setTimeout(() => connectWithRetry(attempt + 1), delay);
    });
}

// Ping the pool every 30 s to detect if the DB goes away after initial connect
function scheduleHealthCheck() {
  setTimeout(() => {
    pool.getConnection()
      .then(conn => {
        conn.release();
        scheduleHealthCheck();
      })
      .catch(err => {
        console.error(`⚠️ MySQL health check failed: ${err.message} — reconnecting…`);
        dbReady = false;
        connectWithRetry(0);
      });
  }, 30000);
}

connectWithRetry(0);

pool.isReady = () => dbReady;

module.exports = pool;