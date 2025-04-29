require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

// MongoDB connection
const { connectDB } = require('./config/db');
connectDB();

// Kafka configuration
const { connectAll } = require('./config/kafka');
const { startAllConsumers } = require('./services/kafkaConsumers');

// Connect to Kafka and start consumers
(async () => {
  try {
    console.log('Initializing Kafka connections...');
    const kafkaConnected = await connectAll();
    
    if (kafkaConnected) {
      console.log('Kafka connections established, starting consumers...');
    await startAllConsumers();
    console.log('Kafka setup complete');
    } else {
      console.error('Failed to connect to Kafka, consumers not started');
    }
  } catch (err) {
    console.error('Failed to set up Kafka:', err);
  }
})();

const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const dishRoutes = require('./routes/dishRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// 1) CORS with credentials
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Your React app's URL
  credentials: true
}));

// 2) Body & Cookie Parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// 3) Session-based auth with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'uberEatsSecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb+srv://BasanthPR:BasIta%4018@cluster0.scx53vu.mongodb.net/uber_eats_db?retryWrites=true&w=majority',
    collectionName: 'sessions'
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4) Define routes
app.use('/auth', authRoutes);
app.use('/customer', customerRoutes);
app.use('/restaurant', restaurantRoutes);
app.use('/dishes', dishRoutes);
app.use('/orders', orderRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
