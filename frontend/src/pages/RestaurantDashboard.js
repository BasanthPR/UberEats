import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

function RestaurantDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/orders/restaurant-orders'); 
        setOrders(res.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchOrders();
  }, []);

  const updateOrderStatus = async (order_id, status) => {
    try {
      await axios.put(`/orders/${order_id}/status`, { status });
      // re-fetch or update local state
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <h2>Restaurant Dashboard</h2>
      {orders.map(order => (
        <div key={order.order_id}>
          <p>Order ID: {order.order_id}</p>
          <p>Status: {order.order_status}</p>
          <button onClick={() => updateOrderStatus(order.order_id, 'Preparing')}>Preparing</button>
          <button onClick={() => updateOrderStatus(order.order_id, 'Delivered')}>Delivered</button>
          {/* etc. */}
        </div>
      ))}
    </div>
  );
}

export default RestaurantDashboard;
