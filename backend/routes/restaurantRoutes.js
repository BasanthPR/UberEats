// routes/restaurantRoutes.js
const express = require('express');
const router = express.Router();
const { User, Restaurant } = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Middleware to check if the user is logged in as a restaurant
function restaurantAuth(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'restaurant') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Middleware to check if user is a restaurant
const isRestaurant = async (req, res, next) => {
  try {
    if (req.user.role !== 'restaurant') {
      return res.status(403).json({ msg: 'Access denied. Not a restaurant account.' });
    }
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../uploads/profile');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'restaurant-' + req.user.id + '-' + uniqueSuffix + ext);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Get all restaurants (public endpoint)
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .populate('user', 'name profile_picture');
      
    const formattedRestaurants = restaurants.map(restaurant => ({
      ...restaurant.toObject(),
      name: restaurant.user.name,
      profile_picture: restaurant.user.profile_picture
    }));
    
    res.json(formattedRestaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get restaurant profile (authenticated)
router.get('/profile', restaurantAuth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.session.user.id })
      .populate('user', 'name email profile_picture');
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant profile not found' });
    }
    
    res.json({
      ...restaurant.toObject(),
      name: restaurant.user.name,
      email: restaurant.user.email,
      profile_picture: restaurant.user.profile_picture
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update restaurant profile
router.put('/profile', restaurantAuth, async (req, res) => {
  try {
    const { name, description, cuisine_type, opening_hours, address, phone, delivery_fee, delivery_time } = req.body;
    
    // Update user info
    if (name) {
      await User.findByIdAndUpdate(
        req.session.user.id,
        { name }
      );
    }
    
    // Update restaurant profile
    await Restaurant.findOneAndUpdate(
      { user: req.session.user.id },
      { 
        description,
        cuisine_type,
        opening_hours,
        address,
        phone,
        delivery_fee,
        delivery_time
      }
    );
    
    res.json({ message: 'Restaurant profile updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific restaurant (public endpoint)
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('user', 'name profile_picture');
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json({
      ...restaurant.toObject(),
      name: restaurant.user.name,
      profile_picture: restaurant.user.profile_picture
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/restaurant/upload-profile-pic
// @desc    Upload restaurant profile picture
// @access  Private (restaurant only)
router.post('/upload-profile-pic', restaurantAuth, upload.single('profile_pic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // Generate URL for the uploaded file
    const profilePicUrl = `/uploads/profile/${req.file.filename}`;
    
    // Update the user model with the profile picture
    await User.findByIdAndUpdate(req.session.user.id, { profile_picture: profilePicUrl });
    
    // Get the restaurant by user ID
    const restaurant = await Restaurant.findOne({ user: req.session.user.id });
    
    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    
    res.json({ 
      success: true, 
      profile_picture: profilePicUrl 
    });
  } catch (err) {
    console.error(err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ msg: 'File size too large. Maximum 5MB allowed.' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
