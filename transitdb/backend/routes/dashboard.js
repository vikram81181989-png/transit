const express = require('express');
const pool    = require('../config/db');
const { auth } = require('../middleware/auth');
const router  = express.Router();

// GET /api/dashboard/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const queries = [
      pool.execute('SELECT COUNT(*) as count FROM routes'),
      pool.execute('SELECT COUNT(*) as count FROM vehicles'),
      pool.execute('SELECT COUNT(*) as count FROM schedules'),
      pool.execute('SELECT COUNT(*) as count FROM passengers'),
      pool.execute('SELECT COUNT(*) as count FROM bookings'),
      pool.execute('SELECT COUNT(*) as count FROM staff'),
      pool.execute("SELECT COUNT(*) as count FROM bookings WHERE status='confirmed'"),
      pool.execute("SELECT COUNT(*) as count FROM routes   WHERE status='delayed'"),
      pool.execute('SELECT COALESCE(SUM(amount),0) as total FROM bookings WHERE status="confirmed"'),
      pool.execute("SELECT COUNT(*) as count FROM vehicles WHERE status='active'"),
    ];
    const results = await Promise.all(queries);
    res.json({
      success: true,
      data: {
        routes:            results[0][0][0].count,
        vehicles:          results[1][0][0].count,
        schedules:         results[2][0][0].count,
        passengers:        results[3][0][0].count,
        bookings:          results[4][0][0].count,
        staff:             results[5][0][0].count,
        confirmedBookings: results[6][0][0].count,
        delayedRoutes:     results[7][0][0].count,
        totalRevenue:      results[8][0][0].total,
        activeVehicles:    results[9][0][0].count,
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/dashboard/audit  — audit log with user info
router.get('/audit', auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const [rows] = await pool.execute(
      `SELECT a.*, u.name as user_name, u.email
       FROM audit_log a LEFT JOIN users u ON a.user_id = u.user_id
       ORDER BY a.timestamp DESC LIMIT ?`,
      [limit]
    );
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/dashboard/recent-bookings
router.get('/recent-bookings', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT b.booking_id, p.name, r.source, r.destination, b.amount, b.status, b.booked_at
       FROM bookings b
       JOIN passengers p ON b.passenger_id = p.passenger_id
       JOIN schedules  s ON b.schedule_id  = s.schedule_id
       JOIN routes     r ON s.route_id     = r.route_id
       ORDER BY b.booked_at DESC LIMIT 10`
    );
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
