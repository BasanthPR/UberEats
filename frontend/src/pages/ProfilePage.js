// src/pages/ProfilePage.js
import React, { useState } from 'react';

function ProfilePage() {
  // Example local state. In a real app, fetch from your backend
  const [name, setName] = useState('Basanth Yajman');
  const [email, setEmail] = useState('basanthyajman@gmail.com'); // usually read-only if you want
  const [country, setCountry] = useState('United States');
  const [stateCode, setStateCode] = useState('CA'); // e.g., "CA"
  const [profilePic, setProfilePic] = useState(null);

  // Handle profile pic upload (client-side demo)
  const handlePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePic(URL.createObjectURL(file)); // preview
    }
  };

  // Save changes (in a real app, do a PUT request)
  const handleSave = () => {
    alert('Profile updated successfully (demo)!');
    // In real usage: axios.put('/customer/profile', { name, country, stateCode, ... })
  };

  return (
    <div className="container mt-4">
      <h2>Profile</h2>
      <div className="row">
        <div className="col-md-4">
          {/* Profile Picture */}
          {profilePic ? (
            <img
              src={profilePic}
              alt="Profile"
              style={{ width: '100%', borderRadius: '50%' }}
            />
          ) : (
            <div
              style={{
                width: '200px',
                height: '200px',
                backgroundColor: '#ccc',
                borderRadius: '50%',
              }}
            >
              {/* Placeholder if no pic */}
            </div>
          )}
          <div className="mt-3">
            <label className="form-label">Update Profile Picture:</label>
            <input type="file" onChange={handlePicChange} />
          </div>
        </div>
        <div className="col-md-8">
          <div className="mb-3">
            <label className="form-label">Name:</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email (read-only):</label>
            <input className="form-control" value={email} readOnly />
          </div>

          <div className="mb-3">
            <label className="form-label">Country:</label>
            <select
              className="form-select"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="Mexico">Mexico</option>
              {/* Add more as needed */}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">State (Abbreviation):</label>
            <input
              className="form-control"
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
