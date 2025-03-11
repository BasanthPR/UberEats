// src/pages/RestaurantDetail.js
import React, { useState } from 'react'; 
// We remove useContext(FavoritesContext) entirely
import { useParams } from 'react-router-dom';
import axios from '../axiosConfig';  

// Logos
import mcDonaldsLogo from '../assets/logos/McDonalds-Logo.png';
import burgerKingLogo from '../assets/logos/Burger_King_2020.svg.png';
import subwayLogo from '../assets/logos/Subway Hi-Res Logo_asset_thumbnail.png';
import sevenElevenLogo from '../assets/logos/711.png';
import dominosLogo from '../assets/logos/Dominos-Logo.png';
import cvsLogo from '../assets/logos/CVS-Symbol.png';

const allPlaces = [
  {
    id: 24,
    name: 'MCDonalds',
    logo: mcDonaldsLogo,
    description: 'Classic fast-food chain known for burgers & fries.',
    products: [
      { productId: 101, productName: 'Big Mac', price: 5.99 },
      { productId: 102, productName: 'McNuggets (6 pc)', price: 3.49 },
    ],
  },
  {
    id: 25,
    name: 'BurgerrKing',
    logo: burgerKingLogo,
    description: 'Home of the Whopper and flame-grilled burgers.',
    products: [
      { productId: 103, productName: 'Whopper', price: 6.49 },
      { productId: 104, productName: 'Onion Rings', price: 2.99 },
    ],
  },
  {
    id: 20,
    name: 'Subbwayy',
    logo: subwayLogo,
    description: 'Famous for fresh subs & sandwiches.',
    products: [
      { productId: 105, productName: 'Footlong Veggie', price: 7.99 },
      { productId: 106, productName: '6" Meatball Marinara', price: 4.99 },
    ],
  },
  {
    id: 21,
    name: '7-11',
    logo: sevenElevenLogo,
    description: 'Convenience store for quick snacks & drinks.',
    products: [
      { productId: 107, productName: 'Slurpee', price: 1.99 },
      { productId: 108, productName: 'Hot Dog', price: 2.49 },
    ],
  },
  {
    id: 22,
    name: 'Dominos',
    logo: dominosLogo,
    description: 'Pizza delivery chain with various crusts & sides.',
    products: [
      { productId: 109, productName: 'Pepperoni Pizza', price: 8.99 },
      { productId: 110, productName: 'Garlic Bread Twists', price: 3.99 },
    ],
  },
  {
    id: 23,
    name: 'CVS Pharmacy',
    logo: cvsLogo,
    description: 'Pharmacy & convenience items.',
    products: [
      { productId: 111, productName: 'Pain Reliever', price: 5.49 },
      { productId: 112, productName: 'Vitamins', price: 9.99 },
    ],
  },
];

/* Existing function to add an item to cart */
async function addToCart(restaurant_id, dish_id, quantity, price_each) {
  try {
    await axios.post('/customer/cart', { restaurant_id, dish_id, quantity, price_each });
    alert('Item added to cart');
  } catch (err) {
    console.error(err);
    alert('Failed to add item');
  }
}

function RestaurantDetail() {
  const { id } = useParams();
  const [addedItemMessage, setAddedItemMessage] = useState('');

  // Find the place from the local array
  const restaurantId = parseInt(id, 10);
  const place = allPlaces.find((p) => p.id === restaurantId);

  if (!place) {
    return <div className="container mt-4">Restaurant/Store not found.</div>;
  }

  // Existing "Add to Cart"
  const handleAddToCart = (product) => {
    addToCart(place.id, product.productId, 1, product.price);
    setAddedItemMessage(`"${product.productName}" has been added to the cart!`);
    setTimeout(() => {
      setAddedItemMessage('');
    }, 3000);
  };

  // NEW: DB-based "Add to Favorites"
  const handleFavorite = async () => {
    try {
      await axios.post('/customer/favorites', { restaurant_id: place.id });
      alert(`${place.name} has been favorited in the DB!`);
    } catch (err) {
      console.error(err);
      alert('Failed to add favorite.');
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <h2>{place.name}</h2>
          <p>{place.description}</p>
        </div>
        {/* Replaced old in-memory toggle approach with a single "Add to Favorites" */}
        <button className="btn btn-outline-danger" onClick={handleFavorite}>
          Add to Favorites
        </button>
      </div>
      <img src={place.logo} alt={place.name} style={{ width: 100 }} />
      <hr />
      {addedItemMessage && (
        <div className="alert alert-success">{addedItemMessage}</div>
      )}
      <h4>Menu:</h4>
      <div className="row">
        {place.products.map((product) => (
          <div key={product.productId} className="col-12 col-md-6 mb-3">
            <div className="border p-3">
              <h5>{product.productName}</h5>
              <p>Price: ${product.price.toFixed(2)}</p>
              <button className="btn btn-primary" onClick={() => handleAddToCart(product)}>
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RestaurantDetail;
