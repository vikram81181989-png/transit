const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/db');
const { auth } = require('../middleware/auth');

const router  = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body; // 🔒 role removed

  if (!name || !email || !password)
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required'
    });

  try {
    const [existing] = await pool.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length)
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });

    const hash = await bcrypt.hash(password, 10);

    // 🔒 Force role = viewer
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)',
      [name, email, hash, 'viewer']
    );

    const token = jwt.sign(
      { user_id: result.insertId, name, email, role: 'viewer' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        user_id: result.insertId,
        name,
        email,
        role: 'viewer'
      }
    });

  } catch (err) {
    console.error("❌ REGISTER ERROR:", err);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({
      success: false,
      message: 'Email and password required'
    });

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!rows.length)
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });

    const token = jwt.sign(
      {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("❌ LOGIN ERROR:", err);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT user_id, name, email, role, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    if (!rows.length)
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });

    res.json({
      success: true,
      user: rows[0]
    });

  } catch (err) {
    console.error("❌ FETCH USER ERROR:", err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// GET /api/auth/users (admin only)
router.get('/users', auth, async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({
      success: false,
      message: 'Admin only'
    });

  try {
    const [rows] = await pool.execute(
      'SELECT user_id, name, email, role, created_at FROM users'
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error("❌ FETCH USERS ERROR:", err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

module.exports = router;