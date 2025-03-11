// src/pages/FavoritesPage.js
import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

// Optional map from restaurant_id -> local logo
import mcDonaldsLogo from '../assets/logos/McDonalds-Logo.png';
import burgerKingLogo from '../assets/logos/Burger_King_2020.svg.png';
import subwayLogo from '../assets/logos/Subway Hi-Res Logo_asset_thumbnail.png';
import sevenElevenLogo from '../assets/logos/711.png';
import dominosLogo from '../assets/logos/Dominos-Logo.png';
import cvsLogo from '../assets/logos/CVS-Symbol.png';

const logoMap = {
  24: mcDonaldsLogo,
  25: burgerKingLogo,
  20: subwayLogo,
  21: sevenElevenLogo,
  22: dominosLogo,
  23: cvsLogo
};

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    axios.get('/customer/favorites')
      .then((res) => {
        setFavorites(res.data); // an array of restaurants from DB
      })
      .catch((err) => console.error('Error fetching favorites:', err));
  }, []);

  return (
    <div className="container mt-4">
      <h2>Your Favorites</h2>
      {favorites.length === 0 ? (
        <p>No favorites yet.</p>
      ) : (
        <div className="row">
          {favorites.map((restaurant) => {
            const logo = logoMap[restaurant.restaurant_id] || null;
            return (
              <div key={restaurant.restaurant_id} className="col-12 col-md-4 mb-3 text-center">
                {logo && <img src={logo} alt={restaurant.name} style={{ width: 100 }} />}
                <h4>{restaurant.name}</h4>
                {restaurant.description && <p>{restaurant.description}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;
