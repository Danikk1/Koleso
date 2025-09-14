-- Очистка таблиц (если нужно пересоздать данные) - будьте осторожны в продакшене!
TRUNCATE TABLE order_items, orders, product_attributes, products, product_categories, manufacturers, users, audit_log RESTART IDENTITY;

-- Вставка категорий
INSERT INTO product_categories (name, slug) VALUES
('Шины', 'tires'),
('Диски', 'wheels');

-- Вставка производителей
INSERT INTO manufacturers (name, country) VALUES
('Michelin', 'France'),
('Bridgestone', 'Japan'),
('BBS', 'Germany'),
('Audi', 'Germany');

-- Вставка товаров (шины и диски)
INSERT INTO products (name, description, price, stock_quantity, category_id, manufacturer_id) VALUES
-- Шины
('Michelin Pilot Sport 4', 'Высокопроизводительная летняя шина.', 15000.00, 100, 1, 1),
('Bridgestone Blizzak LM-005', 'Зимняя шипастая шина для легковых автомобилей.', 12000.00, 80, 1, 2),
-- Диски
('BBS CH-R', 'Легкосплавный диск CH-R от BBS.', 25000.00, 30, 2, 3),
('Audi OEM колесо', 'Оригинальное колесо от Audi.', 30000.00, 15, 2, 4);

-- Вставка атрибутов для товаров
-- Атрибуты для шин
INSERT INTO product_attributes (product_id, attribute_name, attribute_value) VALUES
(1, 'Сезон', 'Лето'),
(1, 'Диаметр', '17'),
(1, 'Ширина', '225'),
(1, 'Профиль', '45'),
(2, 'Сезон', 'Зима'),
(2, 'Диаметр', '16'),
(2, 'Ширина', '205'),
(2, 'Профиль', '55'),
-- Атрибуты для дисков
(3, 'Диаметр', '18'),
(3, 'Ширина', '8'),
(3, 'PCD', '5x112'),
(3, 'Вылет', '45'),
(4, 'Диаметр', '19'),
(4, 'Ширина', '8.5'),
(4, 'PCD', '5x112'),
(4, 'Вылет', '32');

-- Вставка пользователей (пароли: password123, но храним только хэш)
-- Пароль: password123, хэш с помощью bcrypt: $2b$10$exampleexampleexampleexampleexampl
-- В реальности мы будем генерировать хэш в приложении, здесь для примера фиктивный хэш.
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role) VALUES
('admin@example.com', '$2b$10$exampleexampleexampleexampleexampl', 'Иван', 'Петров', '+79123456789', 'admin'),
('user@example.com', '$2b$10$exampleexampleexampleexampleexampl', 'Мария', 'Иванова', '+79876543210', 'user');

-- Вставка заказов
INSERT INTO orders (user_id, status, total_amount) VALUES
(2, 'delivered', 30000.00),
(2, 'new', 25000.00);

-- Вставка элементов заказов
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 4, 1, 30000.00), -- Заказ 1: один диск Audi по 30000
(2, 3, 1, 25000.00); -- Заказ 2: один диск BBS по 25000
