import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navigation = ({ token, setToken }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cart'); // Очищаем корзину при выходе
    setToken(null);
    navigate('/login');
  };
  
  return (
    <nav className="navigation">
      <div className="nav-links">
        <Link to="/products">Товары</Link>
        <Link to="/cart">Корзина</Link>
        <Link to="/orders">Мои заказы</Link>
      </div>
      <button className="logout-btn" onClick={handleLogout}>
        Выйти
      </button>
    </nav>
  );
};

export default Navigation;
