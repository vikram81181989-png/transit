// routes/search.js — public (authenticated) route + schedule search endpoints
const express    = require('express');
const { rateLimit } = require('express-rate-limit');
const pool       = require('../config/db');
const { auth }   = require('../middleware/auth');

const router = express.Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });

/**
 * GET /api/search/routes?source=X&destination=Y
 * Search available routes by source and/or destination (partial, case-insensitive).
 */
router.get('/routes', limiter, auth, async (req, res) => {
  try {
    const { source, destination } = req.query;
    let sql = "SELECT * FROM routes WHERE status != 'cancelled'";
    const params = [];

    if (source) {
      sql += ' AND source LIKE ?';
      params.push(`%${source}%`);
    }
    if (destination) {
      sql += ' AND destination LIKE ?';
      params.push(`%${destination}%`);
    }
    sql += ' ORDER BY source, destination';

    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (_err) {
    res.status(500).json({ success: false, message: 'Failed to search routes' });
  }
});

/**
 * GET /api/search/schedules?route_id=X&min_fare=Y&max_fare=Z
 * Get schedules (with availability) for a route, with optional fare filters.
 */
router.get('/schedules', limiter, auth, async (req, res) => {
  try {
    const { route_id, min_fare, max_fare } = req.query;

    let sql = `
      SELECT s.schedule_id, s.route_id, s.vehicle_id, s.departure, s.arrival,
             s.fare, s.seats_left,
             r.source, r.destination, r.distance_km, r.duration_hrs, r.status as route_status,
             v.vehicle_no, v.type as vehicle_type, v.capacity
      FROM schedules s
      JOIN routes   r ON s.route_id   = r.route_id
      JOIN vehicles v ON s.vehicle_id = v.vehicle_id
      WHERE r.status != 'cancelled'
    `;
    const params = [];

    if (route_id) {
      sql += ' AND s.route_id = ?';
      params.push(Number(route_id));
    }
    if (min_fare) {
      sql += ' AND s.fare >= ?';
      params.push(Number(min_fare));
    }
    if (max_fare) {
      sql += ' AND s.fare <= ?';
      params.push(Number(max_fare));
    }
    sql += ' ORDER BY s.fare ASC, s.departure ASC';

    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (_err) {
    res.status(500).json({ success: false, message: 'Failed to search schedules' });
  }
});

/**
 * GET /api/search/seats/:schedule_id
 * Returns taken seat numbers and vehicle capacity for a given schedule.
 */
router.get('/seats/:schedule_id', limiter, auth, async (req, res) => {
  try {
    const scheduleId = Number(req.params.schedule_id);

    const [schedRows] = await pool.execute(
      `SELECT s.seats_left, s.fare, v.capacity, v.type as vehicle_type
       FROM schedules s
       JOIN vehicles v ON s.vehicle_id = v.vehicle_id
       WHERE s.schedule_id = ?`,
      [scheduleId]
    );

    if (!schedRows.length) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    const [takenRows] = await pool.execute(
      "SELECT seat_no FROM bookings WHERE schedule_id = ? AND status != 'cancelled'",
      [scheduleId]
    );

    res.json({
      success: true,
      capacity:   schedRows[0].capacity,
      seatsLeft:  schedRows[0].seats_left,
      fare:       schedRows[0].fare,
      vehicleType: schedRows[0].vehicle_type,
      takenSeats: takenRows.map(r => r.seat_no),
    });
  } catch (_err) {
    res.status(500).json({ success: false, message: 'Failed to fetch seat info' });
  }
});

module.exports = router;
