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

// Test connection
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  });

module.exports = pool;