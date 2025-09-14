import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Cart = ({ token, setToken }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(savedCart);
  }, []);

  // Функция для проверки валидности токена
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      return Date.now() < expirationTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  // Функция для обновления токена
  const refreshToken = async () => {
    try {
      // Получаем email из текущего токена
      const payload = JSON.parse(atob(token.split('.')[1]));
      const email = payload.sub;
      
      const response = await axios.post('http://localhost:8001/token', new URLSearchParams({
        username: email,
        password: 'test123' // Здесь должен быть правильный пароль
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      const newToken = response.data.access_token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item =>
      item.product_id === productId ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter(item => item.product_id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const checkout = async () => {
  let currentToken = token;
  
  // Проверяем валидность токена
  if (!isTokenValid(currentToken)) {
    try {
      currentToken = await refreshToken();
    } catch (error) {
      alert('Сессия истекла. Пожалуйста, войдите снова.');
      localStorage.removeItem('token');
      localStorage.removeItem('cart');
      window.location.href = '/login';
      return;
    }
  }
  
  try {
    // Получаем информацию о пользователе
    const userResponse = await axios.get('http://localhost:8001/users/me/', {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });
    
    const userId = userResponse.data.user_id;

    // Получаем актуальные цены товаров
    const productsResponse = await axios.get('http://localhost:8001/products/', {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

    // Создаем объект для быстрого поиска цен товаров
    const productPriceMap = {};
    productsResponse.data.forEach(product => {
      productPriceMap[product.product_id] = product.price;
    });

    // Формируем элементы заказа с unit_price
    const orderItems = cartItems.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: productPriceMap[item.product_id] || item.price // Используем актуальную цену
    }));

    console.log('Sending order data:', orderItems);

    const response = await axios.post('http://localhost:8001/orders/', {
      user_id: userId, // Добавляем user_id
      items: orderItems
    }, {
      headers: {
        Authorization: `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Order response:', response.data);

    setCartItems([]);
    localStorage.removeItem('cart');
    alert('Заказ успешно оформлен!');
  } catch (error) {
    console.error('Order error details:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      let errorMessage = 'Неизвестная ошибка';
      
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.detail) {
        // Обрабатываем массив ошибок от Pydantic
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => 
            err.msg || JSON.stringify(err)
          ).join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (Array.isArray(error.response.data)) {
        errorMessage = error.response.data.map(err => 
          err.message || err.msg || JSON.stringify(err)
        ).join(', ');
      } else {
        errorMessage = JSON.stringify(error.response.data);
      }
      
      if (error.response.status === 401) {
        alert('Ошибка аутентификации. Пожалуйста, войдите снова.');
        localStorage.removeItem('token');
        localStorage.removeItem('cart');
        window.location.href = '/login';
      } else {
        alert(`Ошибка при оформлении заказа: ${errorMessage}`);
      }
    } else if (error.request) {
      alert('Ошибка при оформлении заказа: Нет ответа от сервера');
    } else {
      alert(`Ошибка при оформлении заказа: ${error.message}`);
    }
  }
};
      console.log('Sending order data:', 
  return (
    <div className="app-content">
      <h2>Корзина</h2>
      {cartItems.length === 0 ? (
        <p>Ваша корзина пуста</p>
      ) : (
        <div className="cart-container">
          {cartItems.map(item => (
            <div key={item.product_id} className="cart-item">
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p>Цена: {item.price} руб. за шт.</p>
              </div>
              <div className="cart-item-controls">
                <button 
                  className="quantity-btn"
                  onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                >
                  -
                </button>
                <span className="quantity-display">{item.quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                >
                  +
                </button>
                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.product_id)}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
          <div className="cart-total">
            <h3>Итого: {getTotal()} руб.</h3>
            <button className="checkout-btn" onClick={checkout}>
              Оформить заказ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
