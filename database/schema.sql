-- Smart Life Organizer - Database Schema
-- PostgreSQL

CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  profile_image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT
);

CREATE TABLE fixed_schedules (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  day TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  type TEXT NOT NULL
);

CREATE TABLE activities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  priority TEXT DEFAULT 'media',
  deadline TIMESTAMP,
  splittable BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transport (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  duration INTEGER NOT NULL
);

CREATE TABLE habits (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  streak INTEGER DEFAULT 0,
  target INTEGER DEFAULT 1,
  completed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE suggestions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  suggestion TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  read BOOLEAN DEFAULT FALSE,
  generated_at TIMESTAMP DEFAULT NOW()
);

-- Seed categories
INSERT INTO categories (name, icon, color) VALUES
  ('Estudio', '📚', '#6C63FF'),
  ('Trabajo', '💼', '#9F7AEA'),
  ('Obligaciones', '📋', '#4FD1C5'),
  ('Salud', '💪', '#F687B3'),
  ('Pasatiempos', '🎨', '#F6AD55'),
  ('Vida social', '👥', '#63B3ED'),
  ('Vida amorosa', '💕', '#FC8181'),
  ('Descanso', '😴', '#A0AEC0');
