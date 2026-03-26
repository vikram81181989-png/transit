// routes/userProfile.js — user profile management endpoints
const express    = require('express');
const { rateLimit } = require('express-rate-limit');
const pool       = require('../config/db');
const { auth }   = require('../middleware/auth');
const { sanitize, validatePhone } = require('../middleware/validate');

const router = express.Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });

/**
 * GET /api/user/profile
 * Returns the authenticated user's account and linked passenger info.
 */
router.get('/profile', limiter, auth, async (req, res) => {
  try {
    const [userRows] = await pool.execute(
      'SELECT user_id, name, email, role, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    );
    if (!userRows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const [passengerRows] = await pool.execute(
      'SELECT passenger_id, name, phone, email, city FROM passengers WHERE user_id = ?',
      [req.user.user_id]
    );

    res.json({
      success: true,
      user:      userRows[0],
      passenger: passengerRows[0] || null,
    });
  } catch (_err) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
  }
});

/**
 * PUT /api/user/profile
 * Update the user's display name and linked passenger details (phone, city).
 */
router.put('/profile', limiter, auth, async (req, res) => {
  const { name, phone, city } = req.body;

  if (!name || !String(name).trim()) {
    return res.status(400).json({ success: false, message: 'Name is required.' });
  }
  if (phone && !validatePhone(phone)) {
    return res.status(400).json({ success: false, message: 'Invalid phone number (10 digits, starts with 6-9).' });
  }

  const cleanName  = sanitize(name);
  const cleanPhone = phone ? sanitize(phone) : null;
  const cleanCity  = city  ? sanitize(city)  : null;

  try {
    await pool.execute(
      'UPDATE users SET name = ? WHERE user_id = ?',
      [cleanName, req.user.user_id]
    );

    // Update passenger record if it exists
    if (cleanPhone || cleanCity) {
      const [existing] = await pool.execute(
        'SELECT passenger_id FROM passengers WHERE user_id = ?',
        [req.user.user_id]
      );
      if (existing.length) {
        await pool.execute(
          `UPDATE passengers
           SET name  = ?,
               phone = COALESCE(?, phone),
               city  = COALESCE(?, city)
           WHERE passenger_id = ?`,
          [cleanName, cleanPhone, cleanCity, existing[0].passenger_id]
        );
      }
    }

    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (_err) {
    res.status(500).json({ success: false, message: 'Profile update failed.' });
  }
});

module.exports = router;
