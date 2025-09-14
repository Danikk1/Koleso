import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Products = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = {};
        if (filter) params.name = filter;
        if (category) params.category = category;
        
        const response = await axios.get('http://localhost:8001/products/', {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products', error);
      }
    };
    fetchProducts();
  }, [token, filter, category]);

  const addToCart = (product) => {
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = currentCart.find(item => item.product_id === product.product_id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentCart.push({
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        quantity: 1
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(currentCart));
    alert('Товар добавлен в корзину!');
  };

  return (
    <div className="app-content">
      <h2>Товары</h2>
      
      <div className="filters">
        <input
          type="text"
          placeholder="Поиск по названию"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-input"
        />
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="category-select"
        >
          <option value="">Все категории</option>
          <option value="tires">Шины</option>
          <option value="wheels">Диски</option>
        </select>
      </div>
      
      <div className="products-grid">
        {products.map(product => (
          <div key={product.product_id} className="product-card">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p className="product-price">Цена: {product.price} руб.</p>
            <p className="product-stock">В наличии: {product.stock_quantity} шт.</p>
            <button 
              className="add-to-cart-btn"
              onClick={() => addToCart(product)}
              disabled={product.stock_quantity === 0}
            >
              {product.stock_quantity === 0 ? 'Нет в наличии' : 'В корзину'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
