import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

function CustomerDashboard() {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    // fetch restaurants
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get('/restaurant/all'); // an endpoint that returns all restaurants
        setRestaurants(res.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchRestaurants();
  }, []);

  return (
    <div>
      <h2>Customer Dashboard</h2>
      {restaurants.map((rest) => (
        <div key={rest.restaurant_id}>
          <h3>{rest.name}</h3>
          <p>{rest.description}</p>
          <button onClick={() => {/* navigates to restaurant detail page to see dishes */}}>
            View Menu
          </button>
        </div>
      ))}
    </div>
  );
}

export default CustomerDashboard;
