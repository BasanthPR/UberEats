// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { User, Customer, Restaurant } = require('../models/User');
const bcrypt = require('bcryptjs');

// Health check endpoint for Kubernetes
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Create new user
    const newUser = new User({
      name,
      email,
      password, // Will be hashed by pre-save hook
      role
    });
    
    const savedUser = await newUser.save();
    
    // Create profile based on role
    if (role === 'customer') {
      await Customer.create({ user: savedUser._id });
    } else if (role === 'restaurant') {
      await Restaurant.create({ user: savedUser._id });
    }
    
    req.session.user = {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role
    };
    
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Set user session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
});

// Check if user is logged in
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  res.json({
    user: req.session.user
  });
});

// Customer signup
router.post('/customer-signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Create new user with customer role
    const newUser = new User({
      name,
      email,
      password, // Will be hashed by pre-save hook
      role: 'customer'
    });
    
    const savedUser = await newUser.save();
    
    // Create customer profile
    await Customer.create({ user: savedUser._id });
    
    req.session.user = {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role
    };
    
    res.status(201).json({ message: 'Customer created successfully' });
  } catch (error) {
    console.error('Customer signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Restaurant signup
router.post('/restaurant-signup', async (req, res) => {
  try {
    const { name, email, password, location } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Create new user with restaurant role
    const newUser = new User({
      name,
      email,
      password, // Will be hashed by pre-save hook
      role: 'restaurant'
    });
    
    const savedUser = await newUser.save();
    
    // Create restaurant profile
    await Restaurant.create({ 
      user: savedUser._id,
      location: location || null
    });
    
    req.session.user = {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role
    };
    
    res.status(201).json({ message: 'Restaurant created successfully' });
  } catch (error) {
    console.error('Restaurant signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Customer login
router.post('/customer-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email, role: 'customer' });
    if (!user) {
      return res.status(401).json({ error: 'No user found' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Set user session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    res.json({ message: 'Customer login successful' });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

// Restaurant login
router.post('/restaurant-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email, role: 'restaurant' });
    if (!user) {
      return res.status(401).json({ error: 'No user found' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Set user session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    res.json({ message: 'Restaurant login successful' });
  } catch (error) {
    console.error('Restaurant login error:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

module.exports = router;
