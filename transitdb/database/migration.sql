-- ============================================================
-- TransitDB — Migration: production-ready enhancements
-- Run this on existing databases to apply schema upgrades.
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS).
-- ============================================================
USE transitdb;

-- 1. Add user_id to passengers (links passenger to a user account)
ALTER TABLE passengers
  ADD COLUMN IF NOT EXISTS user_id INT NULL AFTER passenger_id;

-- Add index on user_id if not present
CREATE INDEX IF NOT EXISTS idx_passengers_user_id ON passengers (user_id);

-- 2. Add ticket_id to bookings (unique human-readable ticket reference)
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS ticket_id VARCHAR(30) NULL UNIQUE AFTER booking_id;

-- 3. Add performance indexes on frequently queried columns

-- Routes
CREATE INDEX IF NOT EXISTS idx_routes_source      ON routes (source);
CREATE INDEX IF NOT EXISTS idx_routes_destination ON routes (destination);
CREATE INDEX IF NOT EXISTS idx_routes_status      ON routes (status);

-- Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_status    ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_schedule  ON bookings (schedule_id);
CREATE INDEX IF NOT EXISTS idx_bookings_passenger ON bookings (passenger_id);
