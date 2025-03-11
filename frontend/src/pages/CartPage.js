import React, { useState, useEffect, useContext } from 'react';
import axios from '../axiosConfig';
import { CartContext } from '../context/CartContext';

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const { clearCart } = useContext(CartContext);

  // Fetch cart items from backend (user-specific)
  useEffect(() => {
    axios.get('/customer/cart')
      .then((res) => setCartItems(res.data))
      .catch((err) => console.error('Error fetching cart:', err));
  }, []);

  // Calculate total
  const total = cartItems.reduce(
    (acc, item) => acc + item.price_each * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Cart is empty!');
      return;
    }
  
    // Group items by restaurant_id
    const itemsByRestaurant = {};
    cartItems.forEach((item) => {
      if (!itemsByRestaurant[item.restaurant_id]) {
        itemsByRestaurant[item.restaurant_id] = [];
      }
      itemsByRestaurant[item.restaurant_id].push({
        dish_id: item.dish_id,
        quantity: item.quantity,
        price: item.price_each
      });
    });
  
    try {
      // For each restaurant, do a POST /orders
      for (const [restaurant_id, items] of Object.entries(itemsByRestaurant)) {
        await axios.post('/orders', { restaurant_id: parseInt(restaurant_id, 10), items });
      }
      alert('All orders placed successfully!');
  
      // Clear the cart
      await axios.delete('/customer/cart');
      clearCart();
      setCartItems([]);
    } catch (error) {
      console.error(error);
      alert('Checkout failed.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="list-group mb-3">
            {cartItems.map((item, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{item.dish_name}</strong> (x{item.quantity})
                  <br />
                  <small>${(item.price_each * item.quantity).toFixed(2)}</small>
                </div>
              </li>
            ))}
          </ul>
          <h4>Total: ${total.toFixed(2)}</h4>
          <button className="btn btn-success mt-3" onClick={handleCheckout}>
            Checkout
          </button>
        </>
      )}
    </div>
  );
}

export default CartPage;
