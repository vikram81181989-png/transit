const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

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

// Track whether the database is reachable
let dbReady = false;

const MAX_RETRY_DELAY_MS = 30000;

function testConnection(retryDelay) {
  pool.getConnection()
    .then(conn => {
      console.log('✅ MySQL connected');
      conn.release();
      dbReady = true;
      // Connection established — stop retrying
    })
    .catch(err => {
      dbReady = false;
      console.error(`❌ MySQL connection failed: ${err.message} — retrying in ${retryDelay / 1000}s`);
      setTimeout(() => testConnection(Math.min(retryDelay * 2, MAX_RETRY_DELAY_MS)), retryDelay);
    });
}

// Initial connection attempt (non-blocking); first retry after 5s, then 10s, 20s, up to 30s
testConnection(5000);

module.exports = pool;
module.exports.isReady = () => dbReady;