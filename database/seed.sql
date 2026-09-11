-- =========================================================
-- MOBILE LOCATION CYBER PROJECT
-- SIMULATED / EDUCATIONAL SEED DATA
-- PostgreSQL
-- =========================================================

-- WARNING:
-- All phone numbers and location data below are fictional.
-- This dataset is for educational/testing purposes only.


-- =========================================================
-- 1. SIMULATED USERS
-- =========================================================

INSERT INTO users (name, phone, password_hash)
VALUES
    ('Test User 01', '9000000001', 'SIMULATED_PASSWORD_HASH_01'),
    ('Test User 02', '9000000002', 'SIMULATED_PASSWORD_HASH_02'),
    ('Test User 03', '9000000003', 'SIMULATED_PASSWORD_HASH_03'),
    ('Test User 04', '9000000004', 'SIMULATED_PASSWORD_HASH_04'),
    ('Test User 05', '9000000005', 'SIMULATED_PASSWORD_HASH_05'),
    ('Test User 06', '9000000006', 'SIMULATED_PASSWORD_HASH_06'),
    ('Test User 07', '9000000007', 'SIMULATED_PASSWORD_HASH_07'),
    ('Test User 08', '9000000008', 'SIMULATED_PASSWORD_HASH_08'),
    ('Test User 09', '9000000009', 'SIMULATED_PASSWORD_HASH_09'),
    ('Test User 10', '9000000010', 'SIMULATED_PASSWORD_HASH_10'),
    ('Test User 11', '9000000011', 'SIMULATED_PASSWORD_HASH_11'),
    ('Test User 12', '9000000012', 'SIMULATED_PASSWORD_HASH_12'),
    ('Test User 13', '9000000013', 'SIMULATED_PASSWORD_HASH_13'),
    ('Test User 14', '9000000014', 'SIMULATED_PASSWORD_HASH_14'),
    ('Test User 15', '9000000015', 'SIMULATED_PASSWORD_HASH_15'),
    ('Test User 16', '9000000016', 'SIMULATED_PASSWORD_HASH_16'),
    ('Test User 17', '9000000017', 'SIMULATED_PASSWORD_HASH_17'),
    ('Test User 18', '9000000018', 'SIMULATED_PASSWORD_HASH_18'),
    ('Test User 19', '9000000019', 'SIMULATED_PASSWORD_HASH_19'),
    ('Test User 20', '9000000020', 'SIMULATED_PASSWORD_HASH_20'),
    ('Test User 21', '9000000021', 'SIMULATED_PASSWORD_HASH_21'),
    ('Test User 22', '9000000022', 'SIMULATED_PASSWORD_HASH_22'),
    ('Test User 23', '9000000023', 'SIMULATED_PASSWORD_HASH_23')
ON CONFLICT (phone) DO NOTHING;


-- =========================================================
-- 2. SIMULATED TOWERS
-- =========================================================

INSERT INTO towers
    (tower_id, area, latitude, longitude)
VALUES
    ('SIM-TOWER-001', 'Ajmer Area A', 26.446000, 74.638000),
    ('SIM-TOWER-002', 'Ajmer Area B', 26.450000, 74.642000),
    ('SIM-TOWER-003', 'Ajmer Area C', 26.454000, 74.646000),
    ('SIM-TOWER-004', 'Ajmer Area D', 26.458000, 74.650000),
    ('SIM-TOWER-005', 'Ajmer Area E', 26.461000, 74.654000),

    ('SIM-TOWER-006', 'Ajmer Area F', 26.464000, 74.657000),
    ('SIM-TOWER-007', 'Ajmer Area G', 26.467000, 74.660500),
    ('SIM-TOWER-008', 'Ajmer Area H', 26.470000, 74.664000),
    ('SIM-TOWER-009', 'Ajmer Area I', 26.473000, 74.667500),
    ('SIM-TOWER-010', 'Ajmer Area J', 26.476000, 74.671000),

    ('SIM-TOWER-011', 'Ajmer Area K', 26.479000, 74.674500),
    ('SIM-TOWER-012', 'Ajmer Area L', 26.482000, 74.678000),
    ('SIM-TOWER-013', 'Ajmer Area M', 26.485000, 74.681500),
    ('SIM-TOWER-014', 'Ajmer Area N', 26.488000, 74.685000),
    ('SIM-TOWER-015', 'Ajmer Area O', 26.491000, 74.688500),

    ('SIM-TOWER-016', 'Ajmer Area P', 26.494000, 74.692000),
    ('SIM-TOWER-017', 'Ajmer Area Q', 26.497000, 74.695500),
    ('SIM-TOWER-018', 'Ajmer Area R', 26.500000, 74.699000),
    ('SIM-TOWER-019', 'Ajmer Area S', 26.503000, 74.702500),
    ('SIM-TOWER-020', 'Ajmer Area T', 26.506000, 74.706000)
ON CONFLICT (tower_id) DO NOTHING;


-- =========================================================
-- 3. SIMULATED LOCATION HISTORY
-- =========================================================
--
-- Each simulated user visits all 20 simulated towers.
-- Total:
-- 23 users × 20 locations = 460 records
--
-- The coordinates come from the simulated towers.
-- Small deterministic offsets are added to make the
-- dashboard movement visualization more realistic.
-- =========================================================

DELETE FROM location_logs;


INSERT INTO location_logs
    (
        user_id,
        tower_id,
        latitude,
        longitude,
        accuracy,
        recorded_at
    )
SELECT
    u.id,
    t.id,

    t.latitude +
        (((u.id % 5) - 2) * 0.00020),

    t.longitude +
        (((u.id % 4) - 2) * 0.00020),

    5 + ((u.id + t.id) % 11),

    CURRENT_TIMESTAMP
        - INTERVAL '1 minute'
        * (
            ((20 - t.id) * 5)
            + (u.id % 7)
        )

FROM users u
CROSS JOIN towers t

WHERE u.phone LIKE '90000000%';


-- =========================================================
-- 4. VERIFICATION
-- =========================================================

SELECT
    COUNT(*) AS total_users
FROM users
WHERE phone LIKE '90000000%';


SELECT
    COUNT(*) AS total_simulated_towers
FROM towers
WHERE tower_id LIKE 'SIM-TOWER-%';


SELECT
    COUNT(*) AS total_simulated_locations
FROM location_logs;


-- =========================================================
-- 5. USER-WISE LOCATION COUNT
-- =========================================================

SELECT
    u.id,
    u.name,
    COUNT(l.id) AS location_count
FROM users u
LEFT JOIN location_logs l
    ON l.user_id = u.id
WHERE u.phone LIKE '90000000%'
GROUP BY u.id, u.name
ORDER BY u.id;


-- =========================================================
-- END OF SEED DATA
-- =========================================================