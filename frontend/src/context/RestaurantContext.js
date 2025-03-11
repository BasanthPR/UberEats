// src/context/RestaurantContext.js
import React, { createContext, useState } from 'react';

export const RestaurantContext = createContext();

export function RestaurantProvider({ children }) {
  // Dummy restaurant profile data
  const [profile, setProfile] = useState({
    name: 'My Restaurant',
    location: '123 Main St',
    description: 'Delicious food served fresh!',
    contactInfo: '987-1234',
    timings: '08 AM - 10 PM',
    imageUrl: null,
  });

  // Dummy dishes data (list of dishes)
  const [dishes, setDishes] = useState([
    {
      id: 1,
      dishName: 'Margherita Pizza',
      ingredients: 'Tomato, Mozzarella, Basil',
      price: 9.99,
      description: 'Classic pizza with fresh ingredients',
      category: 'Main Course',
      imageUrl: null,
    },
    {
      id: 2,
      dishName: 'Caesar Salad',
      ingredients: 'Romaine, Croutons, Caesar Dressing',
      price: 6.99,
      description: 'Fresh salad with homemade dressing',
      category: 'Salad',
      imageUrl: null,
    },
  ]);

  const updateProfile = (newProfile) => {
    setProfile(newProfile);
  };

  // Add a new dish or edit an existing one
  const addOrEditDish = (dish) => {
    setDishes((prev) => {
      if (dish.id) {
        // edit existing dish
        return prev.map((d) => (d.id === dish.id ? dish : d));
      } else {
        // add new dish; generate a new id
        const newId = prev.length ? prev[prev.length - 1].id + 1 : 1;
        return [...prev, { ...dish, id: newId }];
      }
    });
  };

  return (
    <RestaurantContext.Provider
      value={{ profile, updateProfile, dishes, addOrEditDish }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}
