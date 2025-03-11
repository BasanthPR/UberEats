import React, { useState, useEffect, useContext } from 'react';
import './CustomerHome.css';
import axios from '../axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

// Hero banner image
import heroImage from '../assets/hero.jpg';

// Icons (categories)
import basketIcon from '../assets/icons/basket-shopping-solid.svg';
import burgerIcon from '../assets/icons/burger-solid.svg';
import martiniIcon from '../assets/icons/martini-glass-citrus-solid.svg';
import pizzaIcon from '../assets/icons/pizza-slice-solid.svg';
import plusIcon from '../assets/icons/pills-solid.svg';
import stroopwafelIcon from '../assets/icons/stroopwafel-solid.svg';

// National brands (restaurants) logos
import mcDonaldsLogo from '../assets/logos/McDonalds-Logo.png';
import burgerKingLogo from '../assets/logos/Burger_King_2020.svg.png';
import subwayLogo from '../assets/logos/Subway Hi-Res Logo_asset_thumbnail.png';

// Local stores logos
import sevenElevenLogo from '../assets/logos/711.png';
import dominosLogo from '../assets/logos/Dominos-Logo.png';
import cvsLogo from '../assets/logos/CVS-Symbol.png';

const nationalBrands = [
  {
    id: 24,
    name: 'MCDonalds',
    logo: mcDonaldsLogo,
    products: [
      { productId: 101, productName: 'Big Mac', price: 5.99 },
      { productId: 102, productName: 'McNuggets (6 pc)', price: 3.49 },
    ],
  },
  {
    id: 25,
    name: 'BurgerrKing',
    logo: burgerKingLogo,
    products: [
      { productId: 103, productName: 'Whopper', price: 6.49 },
      { productId: 104, productName: 'Onion Rings', price: 2.99 },
    ],
  },
  {
    id: 20,
    name: 'Subbwayy',
    logo: subwayLogo,
    products: [
      { productId: 105, productName: 'Footlong Veggie', price: 7.99 },
      { productId: 106, productName: '6" Meatball Marinara', price: 4.99 },
    ],
  },
];

const localStores = [
  {
    id: 21,
    name: '7-11',
    logo: sevenElevenLogo,
    products: [
      { productId: 107, productName: 'Slurpee', price: 1.99 },
      { productId: 108, productName: 'Hot Dog', price: 2.49 },
    ],
  },
  {
    id: 22,
    name: 'Dominos',
    logo: dominosLogo,
    products: [
      { productId: 109, productName: 'Pepperoni Pizza', price: 8.99 },
      { productId: 110, productName: 'Garlic Bread Twists', price: 3.99 },
    ],
  },
  {
    id: 23,
    name: 'CVS Pharmacy',
    logo: cvsLogo,
    products: [
      { productId: 111, productName: 'Pain Reliever', price: 5.49 },
      { productId: 112, productName: 'Vitamins', price: 9.99 },
    ],
  },
];

const categories = [
  { name: 'Groceries', icon: basketIcon },
  { name: 'Burgers', icon: burgerIcon },
  { name: 'Drinks', icon: martiniIcon },
  { name: 'Pizza', icon: pizzaIcon },
  { name: 'Desserts', icon: stroopwafelIcon },
  { name: 'More', icon: plusIcon },
];

function CustomerHome() {
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [cartFromServer, setCartFromServer] = useState([]); // if you fetch cart from backend

  // Calculate total quantity from local cart state
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    // For demo, simply navigate. In real app, call /auth/logout API.
    alert('Logged out successfully (demo).');
    navigate('/login');
  };

  // Fetch favorites from the backend (user-specific)
  useEffect(() => {
    axios.get('/customer/favorites')
      .then((res) => setFavorites(res.data))
      .catch((err) => console.error('Error fetching favorites:', err));
  }, []);

  // Optionally, fetch the cart from the backend if it's stored there
  useEffect(() => {
    axios.get('/customer/cart')
      .then((res) => setCartFromServer(res.data))
      .catch((err) => console.error('Error fetching cart:', err));
  }, []);

  return (
    <div className="customer-home">
      <nav className="navbar navbar-expand bg-white shadow-sm p-3">
        <ul className="navbar-nav me-auto d-flex flex-row gap-3">
          <li className="nav-item">
            <Link to="#" className="nav-link">Delivery</Link>
          </li>
          <li className="nav-item">
            <Link to="#" className="nav-link">Pickup</Link>
          </li>
          <li className="nav-item">
            <Link to="#" className="nav-link">Pricing</Link>
          </li>
          <li className="nav-item">
            <Link to="#" className="nav-link">Help</Link>
          </li>
        </ul>
        <div className="d-flex align-items-center">
          {/* CART ICON with badge from local cart */}
          <Link to="/cart" className="position-relative me-3">
            <i className="fas fa-shopping-cart fs-4"></i>
            {cartItemCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                {cartItemCount}
              </span>
            )}
          </Link>
          {/* Favorites link (fetched from backend) */}
          <Link to="/favorites" className="nav-link me-3">Favorites</Link>
          {/* Profile link */}
          <Link to="/profile" className="nav-link me-3">Profile</Link>
          {/* Logout */}
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* CATEGORY ICONS ROW */}
      <div className="categories-container container-fluid bg-light py-2">
        <div className="container d-flex flex-row gap-4 overflow-auto">
          {categories.map((cat, idx) => (
            <div key={idx} className="text-center">
              <img src={cat.icon} alt={cat.name} className="category-icon" />
              <p className="mt-1">{cat.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HERO / AD BANNER SECTION */}
      <div className="hero-banner container my-3">
        <div className="row align-items-center">
          <div className="col-12 col-md-7">
            <h2 className="fw-bold">Crave it? Get it.</h2>
            <p className="mb-4">From the tastiest restaurants, cuisine, or dish.</p>
            <div className="alert alert-info" role="alert">
              Craving Waffles? Get $5 off your first order.
            </div>
          </div>
          <div className="col-12 col-md-5 text-center">
            <img
              src={heroImage}
              alt="Hero Banner"
              className="img-fluid rounded hero-image"
            />
          </div>
        </div>
      </div>

      {/* NATIONAL BRANDS SECTION */}
      <div className="brands-section container my-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>National brands</h3>
          <Link to="#" className="text-success fw-bold">See all</Link>
        </div>
        <div className="d-flex flex-row gap-4 overflow-auto">
          {nationalBrands.map((brand) => (
            <div key={brand.id} className="text-center">
              <Link to={`/restaurant/${brand.id}`}>
                <img src={brand.logo} alt={brand.name} className="brand-logo" />
                <p className="mt-2">{brand.name}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* STORES NEAR YOU SECTION */}
      <div className="stores-section container my-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Stores near you</h3>
          <Link to="#" className="text-success fw-bold">See all</Link>
        </div>
        <div className="d-flex flex-row gap-4 overflow-auto">
          {localStores.map((store) => (
            <div key={store.id} className="text-center">
              <Link to={`/restaurant/${store.id}`}>
                <img src={store.logo} alt={store.name} className="brand-logo" />
                <p className="mt-2">{store.name}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CustomerHome;
