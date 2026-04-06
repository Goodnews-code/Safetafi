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
  ('payments_enabled',  'false')
ON CONFLICT (key) DO NOTHING;
