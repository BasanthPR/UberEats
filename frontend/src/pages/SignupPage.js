// src/pages/SignUpPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpPage.css'; // We'll create minimal styling to match the login page
import axios from '../axiosConfig'; // Or your chosen Axios setup

function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // "customer" or "restaurant"
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      if (role === 'customer') {
        // Customer signup endpoint
        await axios.post('/auth/customer-signup', { name, email, password });
        alert('Customer account created successfully! You can now log in.');
      } else {
        // Restaurant signup endpoint
        await axios.post('/auth/restaurant-signup', { name, email, password });
        alert('Restaurant account created successfully! You can now log in.');
      }
      // After successful signup, navigate to /login
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert('Signup failed');
    }
  };

  return (
    <div className="signup-container d-flex flex-column">
      {/* Top black header with "Uber Eats" */}
      <header className="signup-header bg-black text-white p-3">
        <h1 className="m-0 fs-4">Uber Eats</h1>
      </header>

      <div className="flex-grow-1 d-flex justify-content-center align-items-center bg-light">
        <div className="signup-box bg-white p-4 rounded shadow-sm">
          <h2 className="mb-4 fs-5">Sign Up</h2>

          <form onSubmit={handleSignUp}>
            {/* Name */}
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Role dropdown */}
            <div className="mb-3">
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="customer">Customer</option>
                <option value="restaurant">Restaurant</option>
              </select>
            </div>

            {/* Sign Up button */}
            <button type="submit" className="btn btn-dark w-100">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
