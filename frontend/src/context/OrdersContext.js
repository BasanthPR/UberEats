// src/context/OrdersContext.js
import React, { createContext, useState } from 'react';

export const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  // Dummy orders array
  const [orders, setOrders] = useState([
    // Example order structure:
    // {
    //   orderId: 101,
    //   restaurantId: 1,
    //   customerName: 'John Doe',
    //   customerEmail: 'john@example.com',
    //   status: 'New',
    //   items: [
    //     { dishName: 'Margherita Pizza', quantity: 1 },
    //     { dishName: 'Caesar Salad', quantity: 2 },
    //   ],
    // }
  ]);

  const placeOrder = (newOrder) => {
    setOrders((prev) => [...prev, newOrder]);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.orderId === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <OrdersContext.Provider value={{ orders, placeOrder, updateOrderStatus }}>
      {children}
    </OrdersContext.Provider>
  );
}
