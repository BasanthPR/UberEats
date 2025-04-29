# MongoDB Setup Guide for UberEats Project

This project uses MongoDB Atlas as the primary database. The following guide explains how to set up and use MongoDB for this project.

## Configuration

1. The MongoDB connection string is currently configured for Atlas using the connection string:
   ```
   mongodb+srv://BasanthPR:BasIta%4018@cluster0.scx53vu.mongodb.net/uber_eats_db?retryWrites=true&w=majority
   ```

2. MongoDB is used for:
   - User authentication (with encrypted passwords)
   - Session storage
   - All data storage (customers, restaurants, dishes, orders, etc.)

## Environment Variables

For local development, create a `.env` file in the backend directory with the following variables:

```
# MongoDB Connection
MONGODB_URI="mongodb+srv://BasanthPR:BasIta%4018@cluster0.scx53vu.mongodb.net/uber_eats_db?retryWrites=true&w=majority"

# Session Configuration
SESSION_SECRET="uberEatsSecretKey"

# Server Configuration
PORT=3002
FRONTEND_URL="http://localhost:3000"

# JWT (if needed)
JWT_SECRET="uberEatsJwtSecret"
JWT_EXPIRES_IN="7d"
```

## Data Models

The project uses these primary MongoDB models:

1. **User** - For authentication and basic user information
2. **Customer** - Extended profile for users with the customer role
3. **Restaurant** - Extended profile for users with the restaurant role
4. **Dish** - Food items offered by restaurants
5. **Order** - Customer orders

## Password Encryption

Passwords are encrypted using bcrypt before being stored in the database. The User model has a pre-save hook that automatically hashes the password whenever it's modified.

## Sessions

Sessions are stored in MongoDB using connect-mongo. This allows for persistent sessions even when the server restarts.

## Database Seeding

To seed the database with initial data, run:

```
node scripts/seed.js
```

This will populate the database with:
- Admin user
- Sample customers
- Sample restaurants
- Sample dishes
- Sample orders

## Local Development

To run the server locally with MongoDB connection:

```
npm run dev
``` 