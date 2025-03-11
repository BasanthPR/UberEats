// Example snippet inside a component showing a restaurant's details
import React from 'react';
import axios from '../axiosConfig';

function RestaurantDetail({ restaurant }) {
  const addFavorite = async () => {
    try {
      await axios.post('/customer/favorites', { restaurant_id: restaurant.restaurant_id });
      alert('Restaurant added to favorites!');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      alert('Failed to add favorite.');
    }
  };

  return (
    <div>
      <h2>{restaurant.name}</h2>
      <p>{restaurant.description}</p>
      {/* Other restaurant details */}
      <button onClick={addFavorite}>Add to Favorites</button>
    </div>
  );
}

export default RestaurantDetail;
