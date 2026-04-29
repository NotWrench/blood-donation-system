-- Migration script to add donations table and update requests status constraint
-- Run this if you already have an existing database

-- Step 1: Drop the old constraint on requests.status
ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_status_check;

-- Step 2: Add new constraint with 'fulfilled' status
ALTER TABLE requests ADD CONSTRAINT requests_status_check 
  CHECK (status IN ('pending','approved','rejected','fulfilled'));

-- Step 3: Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  donor_email VARCHAR(255) NOT NULL,
  blood_group VARCHAR(5) NOT NULL,
  units INTEGER NOT NULL,
  location VARCHAR(120) NOT NULL,
  donated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 4: Migrate existing fulfilled requests to donations table
INSERT INTO donations (request_id, donor_email, blood_group, units, location, donated_at)
SELECT id, donor_email, blood_group, units, location, created_at
FROM requests
WHERE status = 'fulfilled' AND donor_email IS NOT NULL
ON CONFLICT DO NOTHING;

-- Verify migration
SELECT 'Migration completed successfully!' AS status;
SELECT COUNT(*) AS total_donations FROM donations;
