// src/context/CartContext.js
import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (restaurantId, product) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.restaurantId === restaurantId && item.productId === product.productId
      );
      if (existingIndex !== -1) {
        // Increase quantity
        const updatedItems = [...prevItems];
        updatedItems[existingIndex].quantity += 1;
        return updatedItems;
      } else {
        // New product
        return [
          ...prevItems,
          {
            restaurantId,
            productId: product.productId,
            productName: product.productName,
            price: product.price,
            quantity: 1,
          },
        ];
      }
    });
  };

  const removeFromCart = (restaurantId, productId) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.restaurantId === restaurantId && item.productId === productId) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}
