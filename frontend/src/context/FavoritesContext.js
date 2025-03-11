// src/context/FavoritesContext.js
import React, { createContext } from 'react';

export const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  // We won't store favorites in memory. The DB approach handles it.
  // We'll keep no-ops for toggleFavorite / isFavorite in case code references them.
  const favorites = [];

  const toggleFavorite = () => {
    console.warn('toggleFavorite called but we use DB-based favorites now.');
  };

  const isFavorite = () => false;

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}
