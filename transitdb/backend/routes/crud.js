const express   = require('express');
const pool      = require('../config/db');
const { auth, requireRole } = require('../middleware/auth');
const logAudit  = require('../middleware/audit');

function crudRouter(table, pk, writeCols, joinQuery = null) {
  const router = express.Router();

  // GET all
  router.get('/', auth, async (_req, res) => {
    try {
      const sql = joinQuery || `SELECT * FROM ${table} ORDER BY ${pk} DESC`;
      const [rows] = await pool.execute(sql);
      res.json({ success: true, data: rows, count: rows.length });
    } catch (_err) {
      res.status(500).json({ success: false, message: 'Failed to fetch records' });
    }
  });

  // GET by ID
  router.get('/:id', auth, async (req, res) => {
    try {
      const [rows] = await pool.execute(`SELECT * FROM ${table} WHERE ${pk} = ?`, [req.params.id]);
      if (!rows.length) return res.status(404).json({ success: false, message: 'Record not found' });
      res.json({ success: true, data: rows[0] });
    } catch (_err) {
      res.status(500).json({ success: false, message: 'Failed to fetch record' });
    }
  });

  // POST create
  router.post('/', auth, requireRole('admin', 'operator'), async (req, res) => {
    const body = req.body;
    const cols = writeCols.filter(c => body[c] !== undefined);
    if (!cols.length) return res.status(400).json({ success: false, message: 'No valid fields provided' });
    const vals = cols.map(c => body[c]);
    try {
      const sql = `INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`;
      const [result] = await pool.execute(sql, vals);
      await logAudit(req.user.user_id, table, 'INSERT', result.insertId, body);
      const [newRow] = await pool.execute(`SELECT * FROM ${table} WHERE ${pk} = ?`, [result.insertId]);
      res.status(201).json({ success: true, data: newRow[0], message: 'Record created' });
    } catch (_err) {
      res.status(500).json({ success: false, message: 'Failed to create record' });
    }
  });

  // PUT update
  router.put('/:id', auth, requireRole('admin', 'operator'), async (req, res) => {
    const body = req.body;
    const cols = writeCols.filter(c => body[c] !== undefined);
    if (!cols.length) return res.status(400).json({ success: false, message: 'No valid fields provided' });
    const vals = [...cols.map(c => body[c]), req.params.id];
    try {
      const sql = `UPDATE ${table} SET ${cols.map(c => `${c}=?`).join(',')} WHERE ${pk}=?`;
      const [result] = await pool.execute(sql, vals);
      if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Record not found' });
      await logAudit(req.user.user_id, table, 'UPDATE', req.params.id, body);
      const [updated] = await pool.execute(`SELECT * FROM ${table} WHERE ${pk} = ?`, [req.params.id]);
      res.json({ success: true, data: updated[0], message: 'Record updated' });
    } catch (_err) {
      res.status(500).json({ success: false, message: 'Failed to update record' });
    }
  });

  // DELETE
  router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
    try {
      const [rows] = await pool.execute(`SELECT * FROM ${table} WHERE ${pk} = ?`, [req.params.id]);
      if (!rows.length) return res.status(404).json({ success: false, message: 'Record not found' });
      await pool.execute(`DELETE FROM ${table} WHERE ${pk} = ?`, [req.params.id]);
      await logAudit(req.user.user_id, table, 'DELETE', req.params.id, rows[0]);
      res.json({ success: true, message: 'Record deleted' });
    } catch (_err) {
      res.status(500).json({ success: false, message: 'Failed to delete record' });
    }
  });

  return router;
}

module.exports = crudRouter;