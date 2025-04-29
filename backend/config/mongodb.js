const mongoose = require('mongoose');
require('dotenv').config();

// Use the MongoDB Atlas connection string provided by the user or fallback to local
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://BasanthPR:BasIta%4018@cluster0.scx53vu.mongodb.net/uber_eats_db?retryWrites=true&w=majority';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB }; 