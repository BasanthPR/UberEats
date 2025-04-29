require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/db');
const { User, Customer, Restaurant } = require('../models/User');
const Dish = require('../models/Dish');
const Order = require('../models/Order');

// Connect to MongoDB
connectDB();

// Sample data for seeding
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Restaurant.deleteMany({});
    await Dish.deleteMany({});
    await Order.deleteMany({});

    console.log('Previous data cleared. Starting to seed...');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@ubereats.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('Admin user created');

    // Create customer users
    const customerUsers = [];
    
    const customer1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'customer'
    });
    customerUsers.push(customer1);

    const customer2 = await User.create({
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: 'password123',
      role: 'customer'
    });
    customerUsers.push(customer2);

    console.log('Customer users created');

    // Create customer profiles
    const customerProfile1 = await Customer.create({
      user: customer1._id,
      address: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zip_code: '94105'
      },
      phone: '555-123-4567'
    });

    const customerProfile2 = await Customer.create({
      user: customer2._id,
      address: {
        street: '456 Market St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zip_code: '94103'
      },
      phone: '555-987-6543'
    });

    console.log('Customer profiles created');

    // Create restaurant users
    const restaurantUser1 = await User.create({
      name: 'Pizza Palace',
      email: 'pizza@example.com',
      password: 'password123',
      role: 'restaurant'
    });

    const restaurantUser2 = await User.create({
      name: 'Sushi Haven',
      email: 'sushi@example.com',
      password: 'password123',
      role: 'restaurant'
    });

    const restaurantUser3 = await User.create({
      name: 'Taco Town',
      email: 'taco@example.com',
      password: 'password123',
      role: 'restaurant'
    });

    console.log('Restaurant users created');

    // Create restaurant profiles
    const restaurant1 = await Restaurant.create({
      user: restaurantUser1._id,
      description: 'The best pizza in town',
      cuisine_type: ['Italian', 'Pizza'],
      opening_hours: {
        monday: { open: '11:00', close: '22:00' },
        tuesday: { open: '11:00', close: '22:00' },
        wednesday: { open: '11:00', close: '22:00' },
        thursday: { open: '11:00', close: '22:00' },
        friday: { open: '11:00', close: '23:00' },
        saturday: { open: '11:00', close: '23:00' },
        sunday: { open: '12:00', close: '21:00' }
      },
      address: {
        street: '789 Mission St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zip_code: '94103'
      },
      phone: '555-111-2222',
      delivery_fee: 3.99,
      delivery_time: '30-45 min',
      rating: 4.7,
      num_ratings: 235
    });

    const restaurant2 = await Restaurant.create({
      user: restaurantUser2._id,
      description: 'Fresh sushi and Japanese cuisine',
      cuisine_type: ['Japanese', 'Sushi', 'Asian'],
      opening_hours: {
        monday: { open: '12:00', close: '21:00' },
        tuesday: { open: '12:00', close: '21:00' },
        wednesday: { open: '12:00', close: '21:00' },
        thursday: { open: '12:00', close: '21:00' },
        friday: { open: '12:00', close: '22:00' },
        saturday: { open: '12:00', close: '22:00' },
        sunday: { open: '12:00', close: '20:00' }
      },
      address: {
        street: '101 Geary St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zip_code: '94108'
      },
      phone: '555-333-4444',
      delivery_fee: 4.99,
      delivery_time: '40-55 min',
      rating: 4.9,
      num_ratings: 189
    });

    const restaurant3 = await Restaurant.create({
      user: restaurantUser3._id,
      description: 'Authentic Mexican street tacos',
      cuisine_type: ['Mexican', 'Tacos', 'Latin American'],
      opening_hours: {
        monday: { open: '10:00', close: '22:00' },
        tuesday: { open: '10:00', close: '22:00' },
        wednesday: { open: '10:00', close: '22:00' },
        thursday: { open: '10:00', close: '22:00' },
        friday: { open: '10:00', close: '00:00' },
        saturday: { open: '10:00', close: '00:00' },
        sunday: { open: '11:00', close: '21:00' }
      },
      address: {
        street: '550 Valencia St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zip_code: '94110'
      },
      phone: '555-555-6666',
      delivery_fee: 2.99,
      delivery_time: '25-40 min',
      rating: 4.5,
      num_ratings: 321
    });

    console.log('Restaurant profiles created');

    // Create dishes for Pizza Palace
    const pizzaDishes = [
      {
        restaurant_id: restaurant1._id,
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and basil',
        price: 12.99,
        image: '/uploads/dishes/margherita.jpg',
        category: 'Pizza',
        available: true
      },
      {
        restaurant_id: restaurant1._id,
        name: 'Pepperoni Pizza',
        description: 'Pizza with tomato sauce, mozzarella, and pepperoni',
        price: 14.99,
        image: '/uploads/dishes/pepperoni.jpg',
        category: 'Pizza',
        available: true
      },
      {
        restaurant_id: restaurant1._id,
        name: 'Garlic Breadsticks',
        description: 'Freshly baked breadsticks with garlic butter',
        price: 5.99,
        image: '/uploads/dishes/breadsticks.jpg',
        category: 'Sides',
        available: true
      },
      {
        restaurant_id: restaurant1._id,
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with Caesar dressing and croutons',
        price: 8.99,
        image: '/uploads/dishes/caesar.jpg',
        category: 'Salad',
        available: true
      }
    ];

    await Dish.insertMany(pizzaDishes);

    // Create dishes for Sushi Haven
    const sushiDishes = [
      {
        restaurant_id: restaurant2._id,
        name: 'California Roll',
        description: 'Crab, avocado, and cucumber roll',
        price: 7.99,
        image: '/uploads/dishes/california.jpg',
        category: 'Rolls',
        available: true
      },
      {
        restaurant_id: restaurant2._id,
        name: 'Spicy Tuna Roll',
        description: 'Spicy tuna and cucumber roll',
        price: 8.99,
        image: '/uploads/dishes/spicy-tuna.jpg',
        category: 'Rolls',
        available: true
      },
      {
        restaurant_id: restaurant2._id,
        name: 'Sashimi Plate',
        description: 'Assorted fresh fish sashimi',
        price: 18.99,
        image: '/uploads/dishes/sashimi.jpg',
        category: 'Sashimi',
        available: true
      },
      {
        restaurant_id: restaurant2._id,
        name: 'Miso Soup',
        description: 'Traditional Japanese soup with tofu and seaweed',
        price: 3.99,
        image: '/uploads/dishes/miso.jpg',
        category: 'Soup',
        available: true
      }
    ];

    await Dish.insertMany(sushiDishes);

    // Create dishes for Taco Town
    const tacoDishes = [
      {
        restaurant_id: restaurant3._id,
        name: 'Carne Asada Taco',
        description: 'Grilled steak taco with onions and cilantro',
        price: 3.99,
        image: '/uploads/dishes/carne-asada.jpg',
        category: 'Tacos',
        available: true
      },
      {
        restaurant_id: restaurant3._id,
        name: 'Chicken Burrito',
        description: 'Burrito with chicken, rice, beans, and salsa',
        price: 9.99,
        image: '/uploads/dishes/chicken-burrito.jpg',
        category: 'Burritos',
        available: true
      },
      {
        restaurant_id: restaurant3._id,
        name: 'Chips and Guacamole',
        description: 'Fresh tortilla chips with homemade guacamole',
        price: 6.99,
        image: '/uploads/dishes/guacamole.jpg',
        category: 'Sides',
        available: true
      },
      {
        restaurant_id: restaurant3._id,
        name: 'Horchata',
        description: 'Sweet rice milk drink with cinnamon',
        price: 2.99,
        image: '/uploads/dishes/horchata.jpg',
        category: 'Drinks',
        available: true
      }
    ];

    await Dish.insertMany(tacoDishes);

    console.log('Dishes created');

    // Create sample orders
    const pizzaDishIds = await Dish.find({ restaurant_id: restaurant1._id }).select('_id name price');
    const sushiDishIds = await Dish.find({ restaurant_id: restaurant2._id }).select('_id name price');

    // Order 1: Pizza order for John
    const pizzaOrder = await Order.create({
      customer_id: customerProfile1._id,
      restaurant_id: restaurant1._id,
      items: [
        {
          dish_id: pizzaDishIds[0]._id,
          name: pizzaDishIds[0].name,
          quantity: 1,
          price: pizzaDishIds[0].price
        },
        {
          dish_id: pizzaDishIds[2]._id,
          name: pizzaDishIds[2].name,
          quantity: 1,
          price: pizzaDishIds[2].price
        }
      ],
      status: 'delivered',
      total_amount: pizzaDishIds[0].price + pizzaDishIds[2].price + 3.99,
      delivery_fee: 3.99,
      delivery_address: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zip_code: '94105'
      },
      payment_method: 'card',
      delivery_time_estimate: '30-45 min',
      order_notes: 'Please ring the doorbell'
    });

    // Order 2: Sushi order for Alice
    const sushiOrder = await Order.create({
      customer_id: customerProfile2._id,
      restaurant_id: restaurant2._id,
      items: [
        {
          dish_id: sushiDishIds[0]._id,
          name: sushiDishIds[0].name,
          quantity: 2,
          price: sushiDishIds[0].price
        },
        {
          dish_id: sushiDishIds[3]._id,
          name: sushiDishIds[3].name,
          quantity: 1,
          price: sushiDishIds[3].price
        }
      ],
      status: 'delivered',
      total_amount: (sushiDishIds[0].price * 2) + sushiDishIds[3].price + 4.99,
      delivery_fee: 4.99,
      delivery_address: {
        street: '456 Market St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zip_code: '94103'
      },
      payment_method: 'card',
      delivery_time_estimate: '40-55 min'
    });

    // Order 3: Another Pizza order for Alice (ongoing)
    const ongoingOrder = await Order.create({
      customer_id: customerProfile2._id,
      restaurant_id: restaurant1._id,
      items: [
        {
          dish_id: pizzaDishIds[1]._id,
          name: pizzaDishIds[1].name,
          quantity: 1,
          price: pizzaDishIds[1].price
        },
        {
          dish_id: pizzaDishIds[3]._id,
          name: pizzaDishIds[3].name,
          quantity: 1,
          price: pizzaDishIds[3].price
        }
      ],
      status: 'preparing',
      total_amount: pizzaDishIds[1].price + pizzaDishIds[3].price + 3.99,
      delivery_fee: 3.99,
      delivery_address: {
        street: '456 Market St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zip_code: '94103'
      },
      payment_method: 'card',
      delivery_time_estimate: '30-45 min'
    });

    console.log('Orders created');
    console.log('Database seeded successfully!');

    return { message: 'Database seeded successfully!' };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Run the seed function and then disconnect
seedDatabase()
  .then(() => {
    console.log('Seeding completed. Disconnecting...');
    mongoose.disconnect();
  })
  .catch(error => {
    console.error('Seeding failed:', error);
    mongoose.disconnect();
    process.exit(1);
  }); 