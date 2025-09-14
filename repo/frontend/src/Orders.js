import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:8001/orders/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders', error);
      }
    };
    fetchOrders();
  }, [token]);

  return (
    <div>
      <h2>Мои заказы</h2>
      {orders.length === 0 ? (
        <p>У вас пока нет заказов</p>
      ) : (
        orders.map(order => (
          <div key={order.order_id} className="order-card">
            <h3>Заказ #{order.order_id}</h3>
            <p>Статус: {order.status}</p>
            <p>Сумма: {order.total_amount} руб.</p>
            <p>Дата: {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
