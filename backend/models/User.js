const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'restaurant', 'admin'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  profile_picture: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Cart item schema
const cartItemSchema = new mongoose.Schema({
  dish_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish',
    required: true
  },
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  price_each: {
    type: Number,
    required: true
  }
});

// Add specific fields for customer role
const customerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zip_code: String
  },
  phone: String,
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  }],
  cart: [cartItemSchema]
});

// Add specific fields for restaurant role
const restaurantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: String,
  cuisine_type: [String],
  opening_hours: {
    type: Map,
    of: {
      open: String,
      close: String
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zip_code: String
  },
  phone: String,
  delivery_fee: Number,
  delivery_time: String,
  rating: {
    type: Number,
    default: 0
  },
  num_ratings: {
    type: Number,
    default: 0
  }
});

// Hash the password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = { User, Customer, Restaurant }; 