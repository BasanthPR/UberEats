import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Providers
import { CartProvider } from './context/CartContext';
import { RestaurantProvider } from './context/RestaurantContext';
import { OrdersProvider } from './context/OrdersContext';
import { FavoritesProvider } from './context/FavoritesContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CustomerDashboard from './pages/CustomerDashboard';
import RestaurantDashboard from './pages/RestaurantDashboard';
import CustomerHome from './pages/CustomerHome';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import RestaurantDetail from './pages/RestaurantDetail';
import CartPage from './pages/CartPage';
import RestaurantHome from './pages/RestaurantHome';
import RestaurantProfilePage from './pages/RestaurantProfilePage';
import RestaurantDishesPage from './pages/RestaurantDishesPage';
import RestaurantOrdersPage from './pages/RestaurantOrdersPage';

function App() {
  return (
    <CartProvider>
      <OrdersProvider>
        <RestaurantProvider>
          <FavoritesProvider>
            <Router>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/customer-dashboard" element={<CustomerDashboard />} />
                <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
                <Route path="/customer-home" element={<CustomerHome />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/restaurant-home" element={<RestaurantHome />} />
                <Route path="/restaurant-profile" element={<RestaurantProfilePage />} />
                <Route path="/restaurant-dishes" element={<RestaurantDishesPage />} />
                <Route path="/restaurant-orders" element={<RestaurantOrdersPage />} />
                <Route path="*" element={<LoginPage />} />
              </Routes>
            </Router>
          </FavoritesProvider>
        </RestaurantProvider>
      </OrdersProvider>
    </CartProvider>
  );
}

export default App;
