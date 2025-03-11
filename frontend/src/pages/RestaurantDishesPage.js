// src/pages/RestaurantDishesPage.js
import React, { useContext, useState } from 'react';
import { RestaurantContext } from '../context/RestaurantContext';

function RestaurantDishesPage() {
  const { dishes, addOrEditDish } = useContext(RestaurantContext);
  const [editingDish, setEditingDish] = useState(null);

  const handleEditClick = (dish) => {
    setEditingDish({ ...dish });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingDish((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditingDish((prev) => ({
        ...prev,
        imageUrl: URL.createObjectURL(file),
      }));
    }
  };

  const handleSave = () => {
    editingDish.price = parseFloat(editingDish.price);
    addOrEditDish(editingDish);
    setEditingDish(null);
  };

  const handleAddNew = () => {
    setEditingDish({
      dishName: '',
      ingredients: '',
      price: '',
      description: '',
      category: 'Main Course',
      imageUrl: null,
    });
  };

  return (
    <div className="container mt-4">
      <h2>Manage Dishes</h2>
      <button className="btn btn-success mb-3" onClick={handleAddNew}>
        Add New Dish
      </button>
      <div className="row">
        {dishes.map((dish) => (
          <div key={dish.id} className="col-md-4 mb-3">
            <div className="border p-2">
              {dish.imageUrl ? (
                <img
                  src={dish.imageUrl}
                  alt={dish.dishName}
                  style={{ width: '100%' }}
                />
              ) : (
                <div style={{ width: '100%', height: '150px', background: '#ccc' }} />
              )}
              <h5>{dish.dishName}</h5>
              <p>Price: ${dish.price.toFixed(2)}</p>
              <p>Category: {dish.category}</p>
              <button
                className="btn btn-primary"
                onClick={() => handleEditClick(dish)}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingDish && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ background: '#fff', padding: '1rem' }}>
            <h4>{editingDish.id ? 'Edit Dish' : 'Add Dish'}</h4>
            <div className="mb-2">
              <label>Dish Name:</label>
              <input
                className="form-control"
                name="dishName"
                value={editingDish.dishName}
                onChange={handleChange}
              />
            </div>
            <div className="mb-2">
              <label>Ingredients:</label>
              <input
                className="form-control"
                name="ingredients"
                value={editingDish.ingredients}
                onChange={handleChange}
              />
            </div>
            <div className="mb-2">
              <label>Price:</label>
              <input
                className="form-control"
                name="price"
                type="number"
                value={editingDish.price}
                onChange={handleChange}
              />
            </div>
            <div className="mb-2">
              <label>Description:</label>
              <input
                className="form-control"
                name="description"
                value={editingDish.description}
                onChange={handleChange}
              />
            </div>
            <div className="mb-2">
              <label>Category:</label>
              <select
                className="form-select"
                name="category"
                value={editingDish.category}
                onChange={handleChange}
              >
                <option value="Appetizer">Appetizer</option>
                <option value="Salad">Salad</option>
                <option value="Main Course">Main Course</option>
                <option value="Dessert">Dessert</option>
              </select>
            </div>
            <div className="mb-2">
              <label>Image:</label>
              <input type="file" onChange={handleImageChange} />
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={handleSave}>
                Save
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setEditingDish(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantDishesPage;
