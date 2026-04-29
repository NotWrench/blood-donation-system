DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'donor' CHECK (role IN ('donor','hospital','admin')),
  phone VARCHAR(30),
  hospital_name VARCHAR(150),
  blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  location VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX users_email_lower_uniq ON users (LOWER(email));

CREATE TABLE inventory (
  blood_group VARCHAR(5) PRIMARY KEY CHECK (blood_group IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  units INTEGER NOT NULL DEFAULT 0 CHECK (units >= 0)
);

CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  units INTEGER NOT NULL CHECK (units > 0),
  location VARCHAR(120) NOT NULL,
  donor_email VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','fulfilled')),
  urgency VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low','normal','high','critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE donations (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  donor_email VARCHAR(255) NOT NULL,
  blood_group VARCHAR(5) NOT NULL,
  units INTEGER NOT NULL,
  location VARCHAR(120) NOT NULL,
  donated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO inventory (blood_group, units) VALUES
  ('A+', 0),
  ('A-', 0),
  ('B+', 0),
  ('B-', 0),
  ('O+', 0),
  ('O-', 0),
  ('AB+', 0),
  ('AB-', 0);
