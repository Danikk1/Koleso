-- Представление для отчета по продажам товаров
CREATE VIEW sales_report AS
SELECT
    p.product_id,
    p.name AS product_name,
    c.name AS category,
    m.name AS manufacturer,
    SUM(oi.quantity) AS total_sold,
    SUM(oi.quantity * oi.unit_price) AS total_revenue
FROM
    products p
    JOIN product_categories c ON p.category_id = c.category_id
    JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id
    LEFT JOIN order_items oi ON p.product_id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.order_id AND o.status = 'delivered' -- Учитываем только доставленные заказы
GROUP BY
    p.product_id, p.name, c.name, m.name
ORDER BY
    total_revenue DESC;

-- Представление для отчета по заказам пользователей
CREATE VIEW user_orders_report AS
SELECT
    u.user_id,
    u.email,
    u.first_name,
    u.last_name,
    COUNT(o.order_id) AS total_orders,
    SUM(o.total_amount) AS total_spent
FROM
    users u
    LEFT JOIN orders o ON u.user_id = o.user_id
GROUP BY
    u.user_id, u.email, u.first_name, u.last_name
ORDER BY
    total_spent DESC;

-- Представление для просмотра актуальных остатков товаров
CREATE VIEW product_stock AS
SELECT
    p.product_id,
    p.name,
    p.stock_quantity,
    c.name AS category,
    m.name AS manufacturer
FROM
    products p
    JOIN product_categories c ON p.category_id = c.category_id
    JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id
WHERE
    p.is_active = TRUE
ORDER BY
    p.stock_quantity ASC;