CREATE OR REPLACE PROCEDURE create_order(
    p_user_id INTEGER,
    p_product_items JSONB -- JSON вида [{"product_id": 1, "quantity": 2}, ...]
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_order_id INTEGER;
    item JSONB;
    v_product_price DECIMAL(10,2);
    v_available_stock INTEGER;
    v_total_amount DECIMAL(10,2) := 0;
BEGIN
    -- Начало транзакции
    BEGIN
        -- Проверяем наличие товаров и рассчитываем итог
        FOR item IN SELECT * FROM jsonb_array_elements(p_product_items)
        LOOP
            SELECT price, stock_quantity INTO v_product_price, v_available_stock
            FROM products WHERE product_id = (item->>'product_id')::INTEGER AND is_active = TRUE;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Product % not found or inactive', (item->>'product_id');
            END IF;

            IF v_available_stock < (item->>'quantity')::INTEGER THEN
                RAISE EXCEPTION 'Insufficient stock for product %. Available: %, requested: %',
                    (item->>'product_id'), v_available_stock, (item->>'quantity')::INTEGER;
            END IF;

            v_total_amount := v_total_amount + (v_product_price * (item->>'quantity')::INTEGER);
        END LOOP;

        -- Создаем запись заказа
        INSERT INTO orders (user_id, total_amount)
        VALUES (p_user_id, v_total_amount)
        RETURNING order_id INTO v_order_id;

        -- Добавляем позиции в заказ и резервируем товары (уменьшаем кол-во на складе)
        FOR item IN SELECT * FROM jsonb_array_elements(p_product_items)
        LOOP
            INSERT INTO order_items (order_id, product_id, quantity, unit_price)
            SELECT v_order_id,
                   (item->>'product_id')::INTEGER,
                   (item->>'quantity')::INTEGER,
                   price
            FROM products WHERE product_id = (item->>'product_id')::INTEGER;

            UPDATE products
            SET stock_quantity = stock_quantity - (item->>'quantity')::INTEGER
            WHERE product_id = (item->>'product_id')::INTEGER;
        END LOOP;

        -- Если всё успешно, коммитим транзакцию
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            -- В случае ошибки откатываем все изменения
            ROLLBACK;
            RAISE; -- Пробрасываем ошибку выше
    END;
END;
$$;

-- Функция-обработчик для триггера
CREATE OR REPLACE FUNCTION log_product_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, new_value, changed_by)
        VALUES (TG_TABLE_NAME, NEW.product_id, 'INSERT', to_jsonb(NEW), current_setting('app.current_user_id', TRUE)::INTEGER);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_value, new_value, changed_by)
        VALUES (TG_TABLE_NAME, NEW.product_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), current_setting('app.current_user_id', TRUE)::INTEGER);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_value, changed_by)
        VALUES (TG_TABLE_NAME, OLD.product_id, 'DELETE', to_jsonb(OLD), current_setting('app.current_user_id', TRUE)::INTEGER);
        RETURN OLD;
    END IF;
END;
$$;

-- Создаем триггер на таблице products
CREATE TRIGGER trigger_audit_product
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION log_product_changes();