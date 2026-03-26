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

// Test connection (non-fatal — app continues even if DB is unavailable at startup)
const MAX_RETRIES = 12; // ~1 minute of retries before giving up
let retryCount = 0;

function testConnection() {
  pool.getConnection()
    .then(conn => {
      console.log('✅ MySQL connected');
      retryCount = 0;
      conn.release();
    })
    .catch(err => {
      retryCount += 1;
      if (retryCount < MAX_RETRIES) {
        console.error(`⚠️  MySQL not yet available (attempt ${retryCount}/${MAX_RETRIES}): ${err.message} — retrying in 5 seconds…`);
        setTimeout(testConnection, 5000);
      } else {
        console.error(`❌ MySQL connection failed after ${MAX_RETRIES} attempts: ${err.message}. Database features will be unavailable.`);
      }
    });
}

testConnection();

module.exports = pool;