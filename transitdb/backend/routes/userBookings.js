// routes/userBookings.js — user-facing booking management endpoints
const express  = require('express');
const pool     = require('../config/db');
const { auth } = require('../middleware/auth');
const { sanitize, validateEmail, validatePhone, requireFields } = require('../middleware/validate');
const logAudit = require('../middleware/audit');

const router = express.Router();

/** Generates a human-readable unique ticket ID. */
function generateTicketId(bookingId) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `TKT-${date}-${bookingId}-${rand}`;
}

/**
 * POST /api/user/book
 * Create a new ticket booking with transaction support.
 * Decrements seats_left and generates a unique ticket_id.
 */
router.post('/book', auth, async (req, res) => {
  const {
    schedule_id,
    seat_no,
    passenger_name,
    passenger_phone,
    passenger_email,
    passenger_city,
  } = req.body;

  // Validate required fields
  const missing = requireFields(['schedule_id', 'seat_no', 'passenger_name', 'passenger_phone'], req.body);
  if (missing) return res.status(400).json({ success: false, message: missing });

  if (!validatePhone(passenger_phone)) {
    return res.status(400).json({ success: false, message: 'Invalid phone number (10 digits, starts with 6-9).' });
  }
  if (passenger_email && !validateEmail(passenger_email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address.' });
  }

  const name   = sanitize(passenger_name);
  const phone  = sanitize(passenger_phone);
  const email  = passenger_email  ? sanitize(passenger_email)  : null;
  const city   = passenger_city   ? sanitize(passenger_city)   : 'Unknown';
  const seatNo = sanitize(String(seat_no));

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Lock the schedule row to prevent race conditions
    const [schedRows] = await conn.execute(
      'SELECT * FROM schedules WHERE schedule_id = ? FOR UPDATE',
      [Number(schedule_id)]
    );
    if (!schedRows.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Schedule not found.' });
    }
    if (schedRows[0].seats_left <= 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'No seats available on this schedule.' });
    }

    // Ensure the seat is not already taken
    const [seatRows] = await conn.execute(
      "SELECT booking_id FROM bookings WHERE schedule_id = ? AND seat_no = ? AND status != 'cancelled'",
      [Number(schedule_id), seatNo]
    );
    if (seatRows.length) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: `Seat ${seatNo} is already taken. Please choose another.` });
    }

    // Resolve or create a passenger record linked to this user
    let passengerId;
    const [existingByUser] = await conn.execute(
      'SELECT passenger_id FROM passengers WHERE user_id = ?',
      [req.user.user_id]
    );

    if (existingByUser.length) {
      passengerId = existingByUser[0].passenger_id;
      await conn.execute(
        'UPDATE passengers SET name = ?, phone = ?, email = ?, city = ? WHERE passenger_id = ?',
        [name, phone, email, city, passengerId]
      );
    } else {
      // Try to link by phone number
      const [existingByPhone] = await conn.execute(
        'SELECT passenger_id FROM passengers WHERE phone = ?',
        [phone]
      );
      if (existingByPhone.length) {
        passengerId = existingByPhone[0].passenger_id;
        // Link this user to the existing passenger record
        await conn.execute(
          'UPDATE passengers SET user_id = ?, name = ?, email = ?, city = ? WHERE passenger_id = ?',
          [req.user.user_id, name, email, city, passengerId]
        );
      } else {
        const [newPass] = await conn.execute(
          'INSERT INTO passengers (name, phone, email, city, user_id) VALUES (?, ?, ?, ?, ?)',
          [name, phone, email, city, req.user.user_id]
        );
        passengerId = newPass.insertId;
      }
    }

    // Create the booking record
    const amount = schedRows[0].fare;
    const [bookResult] = await conn.execute(
      "INSERT INTO bookings (passenger_id, schedule_id, seat_no, status, amount) VALUES (?, ?, ?, 'confirmed', ?)",
      [passengerId, Number(schedule_id), seatNo, amount]
    );
    const bookingId = bookResult.insertId;

    // Generate and store unique ticket ID
    const ticketId = generateTicketId(bookingId);
    await conn.execute(
      'UPDATE bookings SET ticket_id = ? WHERE booking_id = ?',
      [ticketId, bookingId]
    );

    // Decrement available seats
    await conn.execute(
      'UPDATE schedules SET seats_left = seats_left - 1 WHERE schedule_id = ?',
      [Number(schedule_id)]
    );

    await conn.commit();

    // Fetch the full booking details to return
    const [booking] = await pool.execute(
      `SELECT b.*, p.name AS passenger_name, p.phone, p.email AS passenger_email,
              r.source, r.destination, r.distance_km,
              s.departure, s.arrival, s.fare,
              v.vehicle_no, v.type AS vehicle_type
       FROM bookings b
       JOIN passengers p ON b.passenger_id = p.passenger_id
       JOIN schedules  s ON b.schedule_id  = s.schedule_id
       JOIN routes     r ON s.route_id     = r.route_id
       JOIN vehicles   v ON s.vehicle_id   = v.vehicle_id
       WHERE b.booking_id = ?`,
      [bookingId]
    );

    await logAudit(req.user.user_id, 'bookings', 'INSERT', bookingId, { schedule_id, seat_no: seatNo, amount });

    return res.status(201).json({
      success: true,
      message: '🎉 Booking confirmed!',
      data: booking[0],
    });
  } catch (_err) {
    await conn.rollback();
    return res.status(500).json({ success: false, message: 'Booking failed. Please try again.' });
  } finally {
    conn.release();
  }
});

/**
 * GET /api/user/my-bookings
 * Returns all bookings belonging to the authenticated user.
 */
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT b.booking_id, b.ticket_id, b.seat_no, b.status, b.amount, b.booked_at,
              p.name AS passenger_name, p.phone, p.email AS passenger_email,
              r.source, r.destination, r.distance_km,
              s.departure, s.arrival, s.fare, s.schedule_id,
              v.vehicle_no, v.type AS vehicle_type
       FROM bookings b
       JOIN passengers p ON b.passenger_id = p.passenger_id
       JOIN schedules  s ON b.schedule_id  = s.schedule_id
       JOIN routes     r ON s.route_id     = r.route_id
       JOIN vehicles   v ON s.vehicle_id   = v.vehicle_id
       WHERE p.user_id = ?
       ORDER BY b.booked_at DESC`,
      [req.user.user_id]
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (_err) {
    res.status(500).json({ success: false, message: 'Failed to fetch your bookings.' });
  }
});

/**
 * PUT /api/user/bookings/:id/cancel
 * Cancel a booking owned by the current user. Restores seats_left.
 */
router.put('/bookings/:id/cancel', auth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Verify the booking belongs to this user
    const [rows] = await conn.execute(
      `SELECT b.booking_id, b.status, b.schedule_id
       FROM bookings b
       JOIN passengers p ON b.passenger_id = p.passenger_id
       WHERE b.booking_id = ? AND p.user_id = ?`,
      [Number(req.params.id), req.user.user_id]
    );

    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Booking not found or does not belong to you.' });
    }
    if (rows[0].status === 'cancelled') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'This booking has already been cancelled.' });
    }

    await conn.execute(
      "UPDATE bookings SET status = 'cancelled' WHERE booking_id = ?",
      [Number(req.params.id)]
    );

    // Restore the seat to the schedule
    await conn.execute(
      'UPDATE schedules SET seats_left = seats_left + 1 WHERE schedule_id = ?',
      [rows[0].schedule_id]
    );

    await conn.commit();

    await logAudit(req.user.user_id, 'bookings', 'UPDATE', req.params.id, { status: 'cancelled' });

    return res.json({ success: true, message: 'Booking cancelled successfully. Your seat has been released.' });
  } catch (_err) {
    await conn.rollback();
    return res.status(500).json({ success: false, message: 'Cancellation failed. Please try again.' });
  } finally {
    conn.release();
  }
});

module.exports = router;
