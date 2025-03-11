require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const dishRoutes = require('./routes/dishRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// 1) CORS with credentials
app.use(cors({
  origin: 'http://localhost:3000', // Your React app's URL
  credentials: true
}));

// 2) Body & Cookie Parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// 3) Session-based auth
app.use(session({
  secret: process.env.SESSION_SECRET || 'uberEatsSecret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set secure: true if using HTTPS
}));

// 4) Define routes
app.use('/auth', authRoutes);
app.use('/customer', customerRoutes);
app.use('/restaurant', restaurantRoutes);
app.use('/dishes', dishRoutes);
app.use('/orders', orderRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
