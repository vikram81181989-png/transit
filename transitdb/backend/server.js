require('dotenv').config();
const express = require('express');
const cors = require('cors');

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
const {
  routesRouter,
  vehiclesRouter,
  schedulesRouter,
  passengersRouter,
  bookingsRouter,
  staffRouter
} = require('./routes/resources');

app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashRouter);
app.use('/api/routes', routesRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/passengers', passengersRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/staff', staffRouter);

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