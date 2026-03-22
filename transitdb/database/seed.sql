-- ============================================================
-- TransitDB — Seed Data
-- Run after schema.sql
-- ============================================================
USE transitdb;

-- Default admin user (password: Admin@123)
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@transitdb.com', 'temp_password', 'admin'),
('Operator One', 'operator@transitdb.com', 'temp_password', 'operator'),
('Viewer User', 'viewer@transitdb.com', 'temp_password', 'viewer');
-- Routes
INSERT INTO routes (source, destination, distance_km, duration_hrs, status) VALUES
('Hyderabad',  'Bangalore',    570.00,  9.5,  'active'),
('Mumbai',     'Pune',         148.00,  3.0,  'active'),
('Delhi',      'Jaipur',       281.00,  5.0,  'active'),
('Chennai',    'Coimbatore',   498.00,  7.0,  'delayed'),
('Kolkata',    'Bhubaneswar',  440.00,  8.0,  'active'),
('Hyderabad',  'Vijayawada',   275.00,  5.0,  'active'),
('Bangalore',  'Mysore',       144.00,  3.0,  'active'),
('Ahmedabad',  'Surat',        265.00,  4.5,  'active');

-- Vehicles
INSERT INTO vehicles (vehicle_no, type, capacity, operator, status) VALUES
('TS09AB1234', 'Sleeper AC',   40, 'TSRTC',  'active'),
('MH12CD5678', 'Semi-Sleeper', 45, 'MSRTC',  'active'),
('DL01EF9012', 'Volvo AC',     36, 'DTC',    'active'),
('TN07GH3456', 'Ordinary',     52, 'TNSTC',  'delayed'),
('KA05IJ7890', 'Luxury AC',    32, 'KSRTC',  'active'),
('WB03KL2345', 'Sleeper',      48, 'WBSTC',  'active'),
('GJ09MN6789', 'Semi-Sleeper', 40, 'GSRTC',  'maintenance'),
('AP12OP1122', 'Volvo AC',     36, 'APSRTC', 'active');

-- Schedules
INSERT INTO schedules (route_id, vehicle_id, departure, arrival, fare, seats_left) VALUES
(1, 1, '20:00:00', '05:30:00', 950.00,  12),
(2, 2, '06:00:00', '09:00:00', 350.00,  28),
(3, 3, '22:30:00', '03:30:00', 680.00,   5),
(4, 4, '14:00:00', '21:00:00', 450.00,  34),
(1, 5, '07:00:00', '16:30:00', 1100.00, 18),
(5, 6, '18:00:00', '02:00:00', 780.00,  22),
(6, 8, '09:00:00', '14:00:00', 520.00,  15),
(7, 5, '07:30:00', '10:30:00', 280.00,  30),
(8, 7, '11:00:00', '15:30:00', 420.00,   0),
(2, 3, '14:00:00', '17:00:00', 380.00,  19);

-- Passengers
INSERT INTO passengers (name, phone, email, city) VALUES
('Rahul Sharma', '9876543210', 'rahul@email.com',  'Hyderabad'),
('Priya Patel',  '9988776655', 'priya@email.com',  'Mumbai'),
('Amit Kumar',   '9123456789', 'amit@email.com',   'Delhi'),
('Sunita Rao',   '9900112233', NULL,               'Chennai'),
('Vijay Singh',  '9812345678', 'vijay@email.com',  'Kolkata'),
('Neha Gupta',   '9700011122', 'neha@email.com',   'Jaipur'),
('Ravi Verma',   '9611223344', NULL,               'Bangalore'),
('Sana Sheikh',  '9500334455', 'sana@email.com',   'Pune');

-- Bookings
INSERT INTO bookings (passenger_id, schedule_id, seat_no, status, amount) VALUES
(1, 1,  'A1', 'confirmed', 950.00),
(2, 2,  'B3', 'confirmed', 350.00),
(3, 3,  'C2', 'cancelled', 680.00),
(4, 1,  'A2', 'confirmed', 950.00),
(5, 5,  'D4', 'confirmed', 1100.00),
(6, 6,  'E1', 'confirmed', 780.00),
(7, 7,  'A3', 'pending',   520.00),
(8, 8,  'B1', 'confirmed', 280.00),
(1, 10, 'C5', 'confirmed', 380.00),
(2, 4,  'D2', 'cancelled', 450.00);

-- Staff
INSERT INTO staff (name, role, vehicle_id, phone, joined_date) VALUES
('Raju Yadav',      'driver',    1, '9001122334', '2019-03-15'),
('Suresh Babu',     'conductor', 1, '9002233445', '2020-07-01'),
('Mohan Das',       'driver',    2, '9003344556', '2018-11-20'),
('Pradeep Kumar',   'conductor', 3, '9004455667', '2021-01-10'),
('Anand Raj',       'driver',    5, '9005566778', '2017-06-25'),
('Deepak Singh',    'manager', NULL, '9006677889', '2015-04-05'),
('Kavitha Nair',    'conductor', 6, '9007788990', '2022-02-14'),
('Srinivas Reddy',  'driver',    8, '9008899001', '2020-09-30');
