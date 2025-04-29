// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const { User, Customer } = require('../models/User');
const Order = require('../models/Order');
const Dish = require('../models/Dish');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile-pictures')
  },
  filename: function (req, file, cb) {
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Middleware to check if user is logged in
function customerAuth(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'customer') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Upload profile picture
router.post('/profile/picture', customerAuth, upload.single('profile_picture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/uploads/profile-pictures/${req.file.filename}`;
    
    // Update user profile picture
    await User.findByIdAndUpdate(
      req.session.user.id,
      { profile_picture: imageUrl }
    );

    res.json({ 
      message: 'Profile picture updated successfully',
      imageUrl: imageUrl
    });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get customer profile
router.get('/profile', customerAuth, async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.session.user.id })
      .populate('user', 'name email profile_picture');
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found' });
    }
    
    res.json({
      ...customer.toObject(),
      name: customer.user.name,
      email: customer.user.email,
      profile_picture: customer.user.profile_picture
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update customer profile
router.put('/profile', customerAuth, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    // Update user info
    await User.findByIdAndUpdate(
      req.session.user.id,
      { name, email }
    );
    
    // Update customer profile
    await Customer.findOneAndUpdate(
      { user: req.session.user.id },
      { 
        phone,
        address
      }
    );
    
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customer orders
router.get('/orders', customerAuth, async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.session.user.id });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const orders = await Order.find({ customer_id: customer._id })
      .populate({
        path: 'restaurant_id',
        select: 'user',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });
    
    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      restaurant_name: order.restaurant_id.user.name
    }));
    
    res.json(formattedOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customer favorites
router.get('/favorites', customerAuth, async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.session.user.id })
      .populate({
        path: 'favorites',
        populate: {
          path: 'user',
          select: 'name'
        }
      });
    
    if (!customer || !customer.favorites) {
      return res.json([]);
    }
    
    res.json(customer.favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add restaurant to favorites
router.post('/favorites', customerAuth, async (req, res) => {
  try {
    const { restaurant_id } = req.body;
    
    await Customer.findOneAndUpdate(
      { user: req.session.user.id },
      { $addToSet: { favorites: restaurant_id } }
    );
    
    res.json({ message: 'Restaurant added to favorites' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove restaurant from favorites
router.delete('/favorites/:restaurantId', customerAuth, async (req, res) => {
  try {
    await Customer.findOneAndUpdate(
      { user: req.session.user.id },
      { $pull: { favorites: req.params.restaurantId } }
    );
    
    res.json({ message: 'Restaurant removed from favorites' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /customer/cart
router.get('/cart', customerAuth, async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.session.user.id });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    if (!customer.cart) {
      return res.json([]);
    }
    
    // Populate the cart items with dish details
    const populatedCustomer = await Customer.findOne({ user: req.session.user.id })
      .populate({
        path: 'cart.dish_id',
        select: 'name price'
      });
    
    res.json(populatedCustomer.cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /customer/cart - to add an item
router.post('/cart', customerAuth, async (req, res) => {
  try {
    const { restaurant_id, dish_id, quantity, price_each, name } = req.body;
    
    // Find the customer
    const customer = await Customer.findOne({ user: req.session.user.id });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Check if current cart has items from a different restaurant
    if (customer.cart && customer.cart.length > 0) {
      const existingRestaurantId = customer.cart[0].restaurant_id;
      if (existingRestaurantId.toString() !== restaurant_id.toString()) {
        return res.status(400).json({ error: 'Cannot add items from different restaurants. Please clear your cart first.' });
      }
    }
    
    // Check if item already exists in cart
    let existingItemIndex = -1;
    if (customer.cart) {
      existingItemIndex = customer.cart.findIndex(item => 
        item.dish_id.toString() === dish_id.toString() || 
        (typeof item.dish_id === 'number' && item.dish_id === parseInt(dish_id))
      );
    }
    
    let result;
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      customer.cart[existingItemIndex].quantity += quantity;
      result = await customer.save();
      res.json({ 
        message: 'Item quantity updated in cart',
        itemId: customer.cart[existingItemIndex]._id 
      });
    } else {
      // Add new item to cart
      // Since we're seeing issues with ObjectId validation, let's create a new cart item
      // in a way that avoids schema validation errors
      
      // Add new item directly to the cart array
      result = await Customer.findOneAndUpdate(
        { user: req.session.user.id },
        { 
          $push: { 
            cart: { 
              dish_id: dish_id,
              restaurant_id: restaurant_id,
              quantity: quantity,
              price_each: price_each,
              name: name
            } 
          } 
        },
        { new: true }
      );
      
      const newItem = result.cart[result.cart.length - 1];
      res.json({ 
        message: 'Item added to cart',
        itemId: newItem._id 
      });
    }
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
router.put('/cart/:itemId', customerAuth, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    await Customer.findOneAndUpdate(
      { 
        user: req.session.user.id,
        'cart._id': req.params.itemId
      },
      { 
        $set: { 'cart.$.quantity': quantity } 
      }
    );
    
    res.json({ message: 'Cart item updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Remove item from cart
router.delete('/cart/:itemId', customerAuth, async (req, res) => {
  try {
    await Customer.findOneAndUpdate(
      { user: req.session.user.id },
      { 
        $pull: { cart: { _id: req.params.itemId } } 
      }
    );
    
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// Clear cart
router.delete('/cart', customerAuth, async (req, res) => {
  try {
    await Customer.findOneAndUpdate(
      { user: req.session.user.id },
      { $set: { cart: [] } }
    );
    
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;
