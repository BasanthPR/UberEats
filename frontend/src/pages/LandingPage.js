import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState('Deliver now');
  const [address, setAddress] = useState('');

  // If you want to navigate to a "Search Results" page, uncomment this:
  // const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDeliveryOptions = () => {
    setShowDeliveryOptions(!showDeliveryOptions);
  };

  const handleOptionSelect = (option) => {
    setDeliveryOption(option);
    setShowDeliveryOptions(false);
  };

  // "Search" action triggered by the button
  const handleSearch = () => {
    if (!address.trim()) {
      alert('Please enter an address');
      return;
    }

    // Example: Show an alert with the typed address and chosen delivery option
    alert(`Searching for ${address} with option: ${deliveryOption}`);

    // If you have a "Search" page, you can navigate there:
    // navigate(`/search?address=${encodeURIComponent(address)}&option=${deliveryOption}`);
  };

  return (
    <div className="landing-page">
      {/* NAVIGATION BAR */}
      <nav className="navbar px-4 py-2 d-flex justify-content-between align-items-center shadow-sm">
        {/* Left side: Hamburger + Brand */}
        <div className="d-flex align-items-center">
          <button className="hamburger-btn border-0 bg-white me-2" onClick={toggleSidebar}>
            <span className="fs-4">&#9776;</span>
          </button>
          <span className="brand-title fs-5 fw-bold">Uber Eats</span>
        </div>

        {/* Right side: Log in & Sign up buttons */}
        <div>
          <Link to="/login" className="btn btn-dark rounded-pill me-2">Log in</Link>
          <Link to="/signup" className="btn btn-light rounded-pill border">Sign up</Link>
        </div>
      </nav>

      {/* SIDEBAR (LEFT DRAWER) */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={toggleSidebar}>&times;</button>
        <div className="sidebar-content mt-5">
          <Link to="/signup" className="sidebar-button">Sign up</Link>
          <Link to="/login" className="sidebar-button">Login</Link>
          <hr />
          <button className="sidebar-button">Create a business account</button>
          <button className="sidebar-button">Add your restaurant</button>
          <button className="sidebar-button">Sign up to deliver</button>
        </div>
      </div>
      {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}

      {/* HERO SECTION */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Order delivery near you</h1>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div className="dropdown-container">
              <button className="dropdown-btn" onClick={toggleDeliveryOptions}>
                {deliveryOption}
              </button>
              {showDeliveryOptions && (
                <div className="dropdown-options">
                  <div onClick={() => handleOptionSelect('Deliver now')}>Deliver now</div>
                  <div onClick={() => handleOptionSelect('Schedule for later')}>Schedule for later</div>
                </div>
              )}
            </div>
            <button className="search-btn" onClick={handleSearch}>Search here</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
