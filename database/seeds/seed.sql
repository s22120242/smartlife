-- Seed data for development
INSERT INTO users (name, email, password) VALUES
  ('Demo User', 'demo@smartlife.com', '$2a$10$...');

INSERT INTO categories (name, icon, color) VALUES
  ('Estudio', '📚', '#6C63FF'),
  ('Trabajo', '💼', '#9F7AEA'),
  ('Obligaciones', '📋', '#4FD1C5'),
  ('Salud', '💪', '#F687B3'),
  ('Pasatiempos', '🎨', '#F6AD55'),
  ('Vida social', '👥', '#63B3ED'),
  ('Vida amorosa', '💕', '#FC8181'),
  ('Descanso', '😴', '#A0AEC0');
