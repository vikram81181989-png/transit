const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

// ✅ If DATABASE_URL exists → use it (production / Railway)
if (process.env.DATABASE_URL) {
  // Mask credentials robustly (handles passwords that contain '@')
  let maskedUrl = process.env.DATABASE_URL;
  try {
    const parsed = new URL(process.env.DATABASE_URL.replace(/^mysql(2)?:\/\//, 'http://'));
    maskedUrl = process.env.DATABASE_URL.replace(
      /^(mysql(?:2)?:\/\/)([^@]+)@/,
      `$1<credentials>@`
    );
    // If password contains '@', the simple replace above may leave part of it exposed.
    // Fall back to reconstructing from the parsed URL to be safe.
    if (parsed.username || parsed.password) {
      const scheme = process.env.DATABASE_URL.match(/^(mysql(?:2)?:\/\/)/)?.[1] || 'mysql://';
      maskedUrl = `${scheme}<credentials>@${parsed.host}${parsed.pathname}`;
    }
  } catch (_) {
    maskedUrl = '<DATABASE_URL set but could not be parsed>';
  }
  console.log(`[db] Using DATABASE_URL: ${maskedUrl}`);
  pool = mysql.createPool(process.env.DATABASE_URL);
}
// ✅ Otherwise → use individual env vars (local development)
else {
  console.log('[db] DATABASE_URL not set – falling back to individual DB_* env vars');
  console.log(`[db] Connecting to ${process.env.DB_HOST || 'localhost'}:3306/${process.env.DB_NAME || 'transitdb'}`);
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
    if (!process.env.DATABASE_URL) {
      console.error(
        '   Hint: Set DATABASE_URL (e.g. mysql://user:pass@host:3306/dbname) ' +
        'or set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME individually.'
      );
    } else {
      console.error(
        '   Hint: Check that the MySQL service is linked in the Railway dashboard ' +
        'and that DATABASE_URL is being injected correctly.'
      );
    }
    process.exit(1);
  });

module.exports = pool;