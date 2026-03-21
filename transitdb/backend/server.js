require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const app      = express();

// ── Middleware ──
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request logger (dev) ──
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ──
const authRouter      = require('./routes/auth');
const dashRouter      = require('./routes/dashboard');
const { routesRouter, vehiclesRouter, schedulesRouter,
        passengersRouter, bookingsRouter, staffRouter } = require('./routes/resources');

app.use('/api/auth',       authRouter);
app.use('/api/dashboard',  dashRouter);
app.use('/api/routes',     routesRouter);
app.use('/api/vehicles',   vehiclesRouter);
app.use('/api/schedules',  schedulesRouter);
app.use('/api/passengers', passengersRouter);
app.use('/api/bookings',   bookingsRouter);
app.use('/api/staff',      staffRouter);

// ── Health check ──
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── 404 ──
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Error handler ──
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚌 TransitDB API running on http://localhost:${PORT}`);
});
