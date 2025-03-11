import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import axios from '../axiosConfig'; // Axios is pre-configured with withCredentials: true

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // "customer" or "restaurant"
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (role === 'customer') {
        // Call customer login endpoint
        await axios.post('/auth/customer-login', { email, password });
        navigate('/customer-home');
      } else {
        // Call restaurant login endpoint
        await axios.post('/auth/restaurant-login', { email, password });
        navigate('/restaurant-home');
      }
    } catch (error) {
      console.error(error);
      alert('Login failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleGoogleLogin = () => {
    alert('Continue with Google (demo).');
  };

  const handleAppleLogin = () => {
    alert('Continue with Apple (demo).');
  };

  return (
    <div className="login-container d-flex flex-column">
      {/* Top black header with "Uber Eats" */}
      <header className="login-header bg-black text-white p-3">
        <h1 className="m-0 fs-4">Uber Eats</h1>
      </header>

      <div className="flex-grow-1 d-flex justify-content-center align-items-center bg-light">
        <div className="login-box bg-white p-4 rounded shadow-sm">
          <h2 className="mb-4 fs-5">Log In</h2>

          <form onSubmit={handleLogin}>
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

            {/* Login button */}
            <button type="submit" className="btn btn-dark w-100">
              Login
            </button>
          </form>

          <div className="text-center my-3">or</div>

          {/* Social logins (demo) */}
          <button
            className="btn btn-light w-100 border mb-2"
            onClick={handleGoogleLogin}
          >
            <i className="fab fa-google me-2"></i> Continue with Google
          </button>
          <button
            className="btn btn-light w-100 border"
            onClick={handleAppleLogin}
          >
            <i className="fab fa-apple me-2"></i> Continue with Apple
          </button>

          <p className="mt-3 small text-muted">
            By proceeding, you consent to get calls, WhatsApp or SMS messages, including by automatic dialer, from Uber Eats and its affiliates.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
