// Authentication middleware

// Check if user is authenticated (any role)
exports.isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized - Please login first' });
  }
  next();
};

// Check if user is authenticated as customer
exports.isCustomer = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'customer') {
    return res.status(401).json({ error: 'Unauthorized - Customer access only' });
  }
  next();
};

// Check if user is authenticated as restaurant
exports.isRestaurant = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'restaurant') {
    return res.status(401).json({ error: 'Unauthorized - Restaurant access only' });
  }
  next();
};
