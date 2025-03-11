import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

function RestaurantOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchOrders = () => {
    const query = filterStatus ? `?status=${filterStatus}` : '';
    axios.get('/orders/restaurant-orders' + query)
      .then(res => setOrders(res.data))
      .catch(err => console.error('Error fetching orders:', err));
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const handleUpdateStatus = (order_id, newStatus) => {
    axios.put(`/orders/${order_id}/status`, { status: newStatus })
      .then(() => {
        alert('Order status updated');
        fetchOrders();
      })
      .catch(err => {
        console.error(err);
        alert('Failed to update order status');
      });
  };

  return (
    <div className="container mt-4">
      <h2>Manage Orders</h2>
      <div className="mb-3">
        <label>Filter by Status:</label>
        <select className="form-select w-auto d-inline-block ms-2"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All</option>
          <option value="New">New</option>
          <option value="Preparing">Preparing</option>
          <option value="On the Way">On the Way</option>
          <option value="Pick-up Ready">Pick-up Ready</option>
          <option value="Delivered">Delivered</option>
          <option value="Picked Up">Picked Up</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map(order => (
          <div key={order.order_id} className="border p-3 mb-3">
            <h5>Order #{order.order_id}</h5>
            <p>Status: {order.order_status}</p>
            <p>Customer: {order.customerName} ({order.customerEmail})</p>
            <ul>
              {order.items && order.items.map((item, idx) => (
                <li key={idx}>{item.dishName} (x{item.quantity})</li>
              ))}
            </ul>
            <div className="d-flex gap-2 flex-wrap mt-2">
              <button className="btn btn-sm btn-secondary" onClick={() => handleUpdateStatus(order.order_id, 'Order Received')}>Order Received</button>
              <button className="btn btn-sm btn-secondary" onClick={() => handleUpdateStatus(order.order_id, 'Preparing')}>Preparing</button>
              <button className="btn btn-sm btn-secondary" onClick={() => handleUpdateStatus(order.order_id, 'On the Way')}>On the Way</button>
              <button className="btn btn-sm btn-secondary" onClick={() => handleUpdateStatus(order.order_id, 'Pick-up Ready')}>Pick-up Ready</button>
              <button className="btn btn-sm btn-success" onClick={() => handleUpdateStatus(order.order_id, 'Delivered')}>Delivered</button>
              <button className="btn btn-sm btn-success" onClick={() => handleUpdateStatus(order.order_id, 'Picked Up')}>Picked Up</button>
              <button className="btn btn-sm btn-danger" onClick={() => handleUpdateStatus(order.order_id, 'Cancelled')}>Cancelled</button>
            </div>
            <button className="btn btn-link mt-2" onClick={() => alert(`Customer Profile:\nName: ${order.customerName}\nEmail: ${order.customerEmail}`)}>
              View Customer Profile
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default RestaurantOrdersPage;
