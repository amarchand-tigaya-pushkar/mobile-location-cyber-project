-- =========================================================
-- MOBILE LOCATION CYBER PROJECT
-- DATABASE SCHEMA
-- PostgreSQL
-- =========================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Simulated Cell Towers
CREATE TABLE IF NOT EXISTS towers (
    id SERIAL PRIMARY KEY,
    tower_id VARCHAR(50) UNIQUE NOT NULL,
    area VARCHAR(150) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Simulated Location History
CREATE TABLE IF NOT EXISTS location_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    tower_id INTEGER NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_location_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_location_tower
        FOREIGN KEY (tower_id)
        REFERENCES towers(id)
        ON DELETE CASCADE
);


-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_location_logs_user_id
ON location_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_location_logs_tower_id
ON location_logs(tower_id);

CREATE INDEX IF NOT EXISTS idx_location_logs_recorded_at
ON location_logs(recorded_at);


-- =========================================================
-- VERIFICATION
-- =========================================================

SELECT
    'users' AS table_name,
    COUNT(*) AS records
FROM users

UNION ALL

SELECT
    'towers',
    COUNT(*)
FROM towers

UNION ALL

SELECT
    'location_logs',
    COUNT(*)
FROM location_logs;