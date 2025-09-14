import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Products from './Products';
import Cart from './Cart';
import Navigation from './Navigation';
import './App.css';
import Orders from './Orders';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleSetToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  return (
    <Router>
      <div className="App">
        {token && <Navigation token={token} setToken={setToken} />}
        <Routes>
          <Route path="/login" element={!token ? <Login setToken={handleSetToken} /> : <Navigate to="/products" />} />
          <Route path="/products" element={token ? <Products token={token} /> : <Navigate to="/login" />} />
          <Route path="/cart" element={token ? <Cart token={token} /> : <Navigate to="/login" />} />
          <Route path="/orders" element={token ? <Orders token={token} /> : <Navigate to="/login" />} />
	  <Route path="/" element={<Navigate to={token ? "/products" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
