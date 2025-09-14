-- Создание тестовых пользователей
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@example.com', '$2b$12$rL8a.sVp3Zh6iLw6tCzQz.Lq6Z6q6X6X6X6X6X6X6X6X6X6X6X6X6', 'Admin', 'User', 'admin'),
('manager@example.com', '$2b$12$rL8a.sVp3Zh6iLw6tCzQz.Lq6Z6q6X6X6X6X6X6X6X6X6X6X6X6X6', 'Manager', 'User', 'manager'),
('user@example.com', '$2b$12$rL8a.sVp3Zh6iLw6tCzQz.Lq6Z6q6X6X6X6X6X6X6X6X6X6X6X6X6', 'Regular', 'User', 'user');

-- Пароль для всех: test123
