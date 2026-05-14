-- Run this in your Supabase SQL Editor to create the app_settings table
-- and seed the initial trip settings.

CREATE TABLE IF NOT EXISTS app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Seed default values
INSERT INTO app_settings (key, value)
VALUES
  ('trip_date',         'Tuesday, 7th of April, 2026'),
  ('payments_enabled',  'false'),
  ('service_pricing',   '[{"id":"berger","label":"Berger","amount":11000,"icon":"location_on"},{"id":"oshodi","label":"Oshodi","amount":12000,"icon":"location_on"},{"id":"iyanapaja","label":"Iyanapaja","amount":12500,"icon":"location_on"},{"id":"abeokuta","label":"Abeokuta","amount":12000,"icon":"location_on"},{"id":"ibadan","label":"Ibadan","amount":5000,"icon":"location_on"},{"id":"ikorodu","label":"Ikorodu","amount":12500,"icon":"location_on"}]')
ON CONFLICT (key) DO NOTHING;
