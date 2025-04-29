// routes/dishRoutes.js
const express = require('express');
const router = express.Router();
const { Restaurant } = require('../models/User');
const Dish = require('../models/Dish');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

function restaurantAuth(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'restaurant') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Configure multer for dish image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../uploads/dishes');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'dish-' + uniqueSuffix + ext);
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

// Add a dish
router.post('/', restaurantAuth, upload.single('image'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.session.user.id });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    const { name, description, price, category, available } = req.body;
    
    // Set image URL if file was uploaded
    let imageUrl = req.body.image || '';
    if (req.file) {
      imageUrl = `/uploads/dishes/${req.file.filename}`;
    }
    
    const newDish = new Dish({
      restaurant_id: restaurant._id,
      name,
      description,
      price,
      image: imageUrl,
      category,
      available: available !== undefined ? (available === 'true' || available === true) : true
    });
    
    await newDish.save();
    
    res.json({ message: 'Dish added', dish: newDish });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit dish
router.put('/:dishId', restaurantAuth, upload.single('image'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.session.user.id });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    const { dishId } = req.params;
    const { name, description, price, category, available } = req.body;
    
    // Only update image if a new file was uploaded
    let imageUpdate = {};
    if (req.file) {
      imageUpdate = { image: `/uploads/dishes/${req.file.filename}` };
    } else if (req.body.image) {
      imageUpdate = { image: req.body.image };
    }
    
    const dish = await Dish.findOneAndUpdate(
      { _id: dishId, restaurant_id: restaurant._id },
      {
        name,
        description,
        price,
        category,
        available: available !== undefined ? (available === 'true' || available === true) : true,
        ...imageUpdate
      },
      { new: true }
    );
    
    if (!dish) {
      return res.status(404).json({ error: 'Dish not found or not owned by this restaurant' });
    }
    
    res.json({ message: 'Dish updated', dish });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all dishes by this restaurant
router.get('/my-dishes', restaurantAuth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.session.user.id });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    const dishes = await Dish.find({ restaurant_id: restaurant._id });
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public route to view a restaurant's dishes
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const dishes = await Dish.find({ 
      restaurant_id: restaurantId,
      available: true
    });
    
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
