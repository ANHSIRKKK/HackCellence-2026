-- ==============================================================
-- SMART HOLIDAY BOOKING PLATFORM - PRODUCTION RELATIONAL SCHEMA
-- Database: SQLite 3 / Relational Schema
-- ==============================================================

CREATE TABLE IF NOT EXISTS reservations (
    reference VARCHAR(10) PRIMARY KEY,
    trip_id VARCHAR(100) NOT NULL,
    traveler_name VARCHAR(255) NOT NULL,
    home_airport VARCHAR(10) NOT NULL,
    adults INTEGER NOT NULL,
    children INTEGER DEFAULT 0,
    child_ages VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    country VARCHAR(100) NOT NULL,
    budget_inr INTEGER NOT NULL,
    total_inr INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'BOOKED',
    items_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_locks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference VARCHAR(10) NOT NULL,
    resource_type VARCHAR(20) NOT NULL, -- 'FLIGHT' or 'ROOM'
    catalog_id VARCHAR(100) NOT NULL,
    room_id VARCHAR(100),
    start_date DATE,
    end_date DATE,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(reference) REFERENCES reservations(reference) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reservations_ref ON reservations(reference);
CREATE INDEX IF NOT EXISTS idx_locks_resource ON inventory_locks(resource_type, catalog_id);
CREATE INDEX IF NOT EXISTS idx_locks_dates ON inventory_locks(room_id, start_date, end_date);
