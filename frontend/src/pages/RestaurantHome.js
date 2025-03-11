import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

function RestaurantHome() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get('/orders/restaurant-orders')
      .then((res) => setOrders(res.data))
      .catch((err) => console.error('Error fetching orders:', err));
  }, []);

  const handleLogout = () => {
    axios.post('/auth/logout')
      .then(() => {
        alert('Logged out successfully');
        navigate('/login');
      })
      .catch(err => {
        console.error(err);
        alert('Logout failed');
      });
  };

  return (
    <div className="container mt-4">
      <h2>Restaurant Dashboard</h2>
      <p>Manage your restaurant profile, dishes, and orders here.</p>
      <nav className="navbar navbar-expand bg-white shadow-sm p-3 mb-4">
        <ul className="navbar-nav me-auto d-flex flex-row gap-3">
          <li className="nav-item">
            <Link to="/restaurant-profile" className="nav-link">Profile</Link>
          </li>
          <li className="nav-item">
            <Link to="/restaurant-dishes" className="nav-link">Dishes</Link>
          </li>
          <li className="nav-item">
            <Link to="/restaurant-orders" className="nav-link">Orders</Link>
          </li>
        </ul>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </nav>
      <div>
        <h4>Current Orders</h4>
        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <ul>
            {orders.map(order => (
              <li key={order.order_id}>
                Order #{order.order_id} - {order.order_status}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default RestaurantHome;
