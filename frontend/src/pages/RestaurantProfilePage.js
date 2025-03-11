// src/pages/RestaurantProfilePage.js
import React, { useContext, useState } from 'react';
import { RestaurantContext } from '../context/RestaurantContext';

function RestaurantProfilePage() {
  const { profile, updateProfile } = useContext(RestaurantContext);
  const [tempProfile, setTempProfile] = useState(profile);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile image upload (demo only)
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTempProfile((prev) => ({
        ...prev,
        imageUrl: URL.createObjectURL(file),
      }));
    }
  };

  const handleSave = () => {
    updateProfile(tempProfile);
    alert('Profile updated (demo).');
  };

  return (
    <div className="container mt-4">
      <h2>Restaurant Profile</h2>
      <div className="row">
        <div className="col-md-4">
          {tempProfile.imageUrl ? (
            <img
              src={tempProfile.imageUrl}
              alt="Restaurant"
              style={{ width: '100%', borderRadius: '8px' }}
            />
          ) : (
            <div
              style={{
                width: '200px',
                height: '200px',
                backgroundColor: '#ccc',
                borderRadius: '8px',
              }}
            />
          )}
          <div className="mt-3">
            <label>Update Image:</label>
            <input type="file" onChange={handleImageChange} />
          </div>
        </div>
        <div className="col-md-8">
          <div className="mb-3">
            <label>Name:</label>
            <input
              className="form-control"
              name="name"
              value={tempProfile.name}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label>Location:</label>
            <input
              className="form-control"
              name="location"
              value={tempProfile.location}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label>Description:</label>
            <textarea
              className="form-control"
              name="description"
              value={tempProfile.description}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label>Contact Info:</label>
            <input
              className="form-control"
              name="contactInfo"
              value={tempProfile.contactInfo}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label>Timings:</label>
            <input
              className="form-control"
              name="timings"
              value={tempProfile.timings}
              onChange={handleChange}
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

export default RestaurantProfilePage;
