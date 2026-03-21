const pool = require('../config/db');

/**
 * Writes an entry to audit_log whenever a row is inserted/updated/deleted.
 */
const logAudit = async (userId, tableName, action, recordId, changes = null) => {
  try {
    await pool.execute(
      `INSERT INTO audit_log (user_id, table_name, action, record_id, changes) VALUES (?,?,?,?,?)`,
      [userId || null, tableName, action, recordId, changes ? JSON.stringify(changes) : null]
    );
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = logAudit;
