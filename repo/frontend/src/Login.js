import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('Login attempt with:', email, password);
  
  try{
    const response = await axios.post('http://localhost:8001/token', new URLSearchParams({
  username: email,
  password: password,
}), {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});
    
    console.log('Login successful:', response.data);
    setToken(response.data.access_token);
    localStorage.setItem('token', response.data.access_token);
    
    // Добавим принудительную перезагрузку для применения токена
    window.location.href = '/products';
  } catch (error) {
    console.error('Login error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      alert(`Login failed: ${error.response.data.detail || 'Unknown error'}`);
    } else {
      alert('Login failed: No response from server');
    }
  }
};
  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
