// src/pages/Favorites.js
import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

function Favorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get('/customer/favorites');
        setFavorites(response.data);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };
    fetchFavorites();
  }, []);

  return (
    <div>
      <h2>Your Favorite Restaurants</h2>
      {favorites.length === 0 ? (
        <p>You have not added any favorites yet.</p>
      ) : (
        <ul>
          {favorites.map((restaurant) => (
            <li key={restaurant.restaurant_id}>
              <h3>{restaurant.name}</h3>
              <p>{restaurant.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Favorites;
