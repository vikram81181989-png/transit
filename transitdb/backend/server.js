require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');

const app = express();

// ── CORS FIX ──
const allowedOrigins = [
  'http://localhost:5173',
  'https://transit-ebon.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / curl

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));

// ── Middleware ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global API rate limit: 200 requests per 15 minutes per IP
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
// Stricter limit for booking (prevent booking spam): 30 per 15 minutes
const bookingLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many booking requests. Please wait before trying again.' });

// ── Request logger (clean + safe) ──
app.use((req, _res, next) => {
  const safeUrl = req.url.replace(/[^\w\s\-\/\.\?\=\&]/g, '');
  const safeMethod = req.method.replace(/[^A-Z]/g, '');
  console.log(`[${new Date().toISOString()}] ${safeMethod} ${safeUrl}`);
  next();
});

// ── Routes ──
const authRouter = require('./routes/auth');
const dashRouter = require('./routes/dashboard');
const searchRouter = require('./routes/search');
const userBookingsRouter = require('./routes/userBookings');
const userProfileRouter = require('./routes/userProfile');
const {
  routesRouter,
  vehiclesRouter,
  schedulesRouter,
  passengersRouter,
  bookingsRouter,
  staffRouter
} = require('./routes/resources');

// Apply strict rate limit on auth endpoints (20 attempts per 15 minutes)
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many login attempts. Please wait and try again.' });

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/dashboard', apiLimiter, dashRouter);
app.use('/api/search', apiLimiter, searchRouter);
app.use('/api/user/book', bookingLimiter);
app.use('/api/user', apiLimiter, userBookingsRouter);
app.use('/api/user', apiLimiter, userProfileRouter);
app.use('/api/routes', apiLimiter, routesRouter);
app.use('/api/vehicles', apiLimiter, vehiclesRouter);
app.use('/api/schedules', apiLimiter, schedulesRouter);
app.use('/api/passengers', apiLimiter, passengersRouter);
app.use('/api/bookings', apiLimiter, bookingsRouter);
app.use('/api/staff', apiLimiter, staffRouter);

// ── Health check ──
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date() })
);

// ── 404 ──
app.use((_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' })
);

// ── Error handler ──
app.use((err, _req, res, _next) => {
  console.error('❌ Internal error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Server start ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 TransitDB API running on port ${PORT}`);
});