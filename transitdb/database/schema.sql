-- ============================================================
-- TransitDB — MySQL Schema
-- Run this first to create the database and all tables
-- ============================================================

CREATE DATABASE IF NOT EXISTS transitdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE transitdb;

-- Users (Authentication)
CREATE TABLE IF NOT EXISTS users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','operator','viewer') NOT NULL DEFAULT 'viewer',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Routes
CREATE TABLE IF NOT EXISTS routes (
  route_id      INT AUTO_INCREMENT PRIMARY KEY,
  source        VARCHAR(100) NOT NULL,
  destination   VARCHAR(100) NOT NULL,
  distance_km   DECIMAL(8,2) NOT NULL,
  duration_hrs  DECIMAL(5,2) NOT NULL,
  status        ENUM('active','delayed','cancelled') NOT NULL DEFAULT 'active',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  vehicle_id    INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_no    VARCHAR(20) NOT NULL UNIQUE,
  type          VARCHAR(50) NOT NULL,
  capacity      INT NOT NULL,
  operator      VARCHAR(80) NOT NULL,
  status        ENUM('active','delayed','maintenance') NOT NULL DEFAULT 'active',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Schedules
CREATE TABLE IF NOT EXISTS schedules (
  schedule_id   INT AUTO_INCREMENT PRIMARY KEY,
  route_id      INT NOT NULL,
  vehicle_id    INT NOT NULL,
  departure     TIME NOT NULL,
  arrival       TIME NOT NULL,
  fare          DECIMAL(10,2) NOT NULL,
  seats_left    INT NOT NULL DEFAULT 0,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (route_id)   REFERENCES routes(route_id)   ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE
);

-- Passengers
CREATE TABLE IF NOT EXISTS passengers (
  passenger_id  INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  phone         VARCHAR(15) NOT NULL UNIQUE,
  email         VARCHAR(150),
  city          VARCHAR(80) NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  booking_id    INT AUTO_INCREMENT PRIMARY KEY,
  passenger_id  INT NOT NULL,
  schedule_id   INT NOT NULL,
  seat_no       VARCHAR(10) NOT NULL,
  status        ENUM('confirmed','cancelled','pending') NOT NULL DEFAULT 'confirmed',
  amount        DECIMAL(10,2) NOT NULL,
  booked_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (passenger_id) REFERENCES passengers(passenger_id) ON DELETE CASCADE,
  FOREIGN KEY (schedule_id)  REFERENCES schedules(schedule_id)  ON DELETE CASCADE
);

-- Staff
CREATE TABLE IF NOT EXISTS staff (
  staff_id      INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  role          ENUM('driver','conductor','manager') NOT NULL,
  vehicle_id    INT,
  phone         VARCHAR(15) NOT NULL UNIQUE,
  joined_date   DATE NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE SET NULL
);

-- Audit Log (auto-tracks every change)
CREATE TABLE IF NOT EXISTS audit_log (
  log_id        INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT,
  table_name    VARCHAR(50) NOT NULL,
  action        ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  record_id     INT NOT NULL,
  changes       JSON,
  timestamp     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);
