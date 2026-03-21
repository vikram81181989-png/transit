// routes/resources.js — registers all resource routes
const crudRouter = require('./crud');

// Routes table
const routesRouter = crudRouter(
  'routes', 'route_id',
  ['source', 'destination', 'distance_km', 'duration_hrs', 'status']
);

// Vehicles table
const vehiclesRouter = crudRouter(
  'vehicles', 'vehicle_id',
  ['vehicle_no', 'type', 'capacity', 'operator', 'status']
);

// Schedules table (with JOIN for display)
const schedulesRouter = crudRouter(
  'schedules', 'schedule_id',
  ['route_id', 'vehicle_id', 'departure', 'arrival', 'fare', 'seats_left'],
  `SELECT s.*, r.source, r.destination, v.vehicle_no, v.type as vehicle_type
   FROM schedules s
   JOIN routes r   ON s.route_id   = r.route_id
   JOIN vehicles v ON s.vehicle_id = v.vehicle_id
   ORDER BY s.schedule_id DESC`
);

// Passengers table
const passengersRouter = crudRouter(
  'passengers', 'passenger_id',
  ['name', 'phone', 'email', 'city']
);

// Bookings table (with JOIN)
const bookingsRouter = crudRouter(
  'bookings', 'booking_id',
  ['passenger_id', 'schedule_id', 'seat_no', 'status', 'amount'],
  `SELECT b.*, p.name as passenger_name, p.phone,
          r.source, r.destination, s.departure, s.fare
   FROM bookings b
   JOIN passengers p ON b.passenger_id = p.passenger_id
   JOIN schedules  s ON b.schedule_id  = s.schedule_id
   JOIN routes     r ON s.route_id     = r.route_id
   ORDER BY b.booking_id DESC`
);

// Staff table (with JOIN)
const staffRouter = crudRouter(
  'staff', 'staff_id',
  ['name', 'role', 'vehicle_id', 'phone', 'joined_date'],
  `SELECT s.*, v.vehicle_no FROM staff s
   LEFT JOIN vehicles v ON s.vehicle_id = v.vehicle_id
   ORDER BY s.staff_id DESC`
);

module.exports = { routesRouter, vehiclesRouter, schedulesRouter, passengersRouter, bookingsRouter, staffRouter };
