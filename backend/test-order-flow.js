/**
 * Order Flow Test Script
 * 
 * This script simulates a complete order flow for testing Kafka message flow:
 * 1. Create an order
 * 2. Restaurant updates order status (multiple stages)
 * 3. Order is delivered
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectAll, disconnectAll, sendMessage, TOPICS } = require('./config/kafka');
const { initRealtimeLog } = require('./utils/kafkaRealTimeLogger');
const Order = require('./models/Order');
const { Customer, Restaurant } = require('./models/User');

// Create order function
async function createTestOrder(customerId, restaurantId) {
  console.log(`Creating test order for customer: ${customerId}, restaurant: ${restaurantId}`);
  
  const order = new Order({
    customer_id: customerId,
    restaurant_id: restaurantId,
    items: [
      {
        dish_id: new mongoose.Types.ObjectId(), // Generate a random ID
        name: 'Test Burger',
        quantity: 2,
        price: 9.99
      },
      {
        dish_id: new mongoose.Types.ObjectId(), // Generate a random ID
        name: 'Test Fries',
        quantity: 1,
        price: 4.99
      }
    ],
    status: 'placed',
    total_amount: 24.97,
    delivery_fee: 3.99,
    delivery_address: '123 Test Street, Test City',
    payment_method: 'card'
  });

  await order.save();
  console.log(`Order created with ID: ${order._id}`);
  return order;
}

// Update order status function
async function updateOrderStatus(orderId, previousStatus, newStatus) {
  console.log(`Updating order ${orderId} from ${previousStatus} to ${newStatus}`);
  
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }
  
  // Update status in database
  order.status = newStatus;
  await order.save();
  
  return order;
}

// Main test function
async function testOrderFlow() {
  try {
    // Initialize MongoDB connection
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://BasanthPR:BasIta%4018@cluster0.scx53vu.mongodb.net/uber_eats_db?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB connected');
    
    // Connect to Kafka
    console.log('Connecting to Kafka...');
    await connectAll();
    console.log('Kafka connected');
    
    // Ensure real-time log is initialized
    initRealtimeLog();
    
    // Find test customer (test@gmail.com) and restaurant (mm@gmail.com)
    console.log('Finding test accounts...');
    
    const testCustomerUser = await mongoose.model('User').findOne({ email: 'test@gmail.com' });
    if (!testCustomerUser) {
      throw new Error('Test customer account not found');
    }
    
    const testCustomer = await Customer.findOne({ user: testCustomerUser._id });
    if (!testCustomer) {
      throw new Error('Test customer profile not found');
    }
    
    const testRestaurantUser = await mongoose.model('User').findOne({ email: 'mm@gmail.com' });
    if (!testRestaurantUser) {
      throw new Error('Test restaurant account not found');
    }
    
    const testRestaurant = await Restaurant.findOne({ user: testRestaurantUser._id });
    if (!testRestaurant) {
      throw new Error('Test restaurant profile not found');
    }
    
    console.log(`Found test customer: ${testCustomer._id} and restaurant: ${testRestaurant._id}`);
    
    // 1. CREATE ORDER
    console.log('\n1. CREATING ORDER...');
    const order = await createTestOrder(testCustomer._id, testRestaurant._id);
    
    // Send order created event to Kafka
    await sendMessage(TOPICS.ORDER_CREATED, {
      order_id: order._id,
      restaurant_id: order.restaurant_id,
      customer_id: order.customer_id,
      status: order.status,
      timestamp: new Date().toISOString()
    });
    
    // Notify restaurant about new order
    await sendMessage(TOPICS.RESTAURANT_NOTIFICATION, {
      type: 'NEW_ORDER',
      order_id: order._id,
      restaurant_id: order.restaurant_id,
      timestamp: new Date().toISOString()
    });
    
    // Wait for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 2. UPDATE ORDER STATUS TO PREPARING
    console.log('\n2. UPDATING ORDER STATUS TO PREPARING...');
    await updateOrderStatus(order._id, 'placed', 'Preparing');
    
    // Send order updated event
    await sendMessage(TOPICS.ORDER_UPDATED, {
      order_id: order._id,
      previous_status: 'placed',
      new_status: 'Preparing',
      restaurant_id: order.restaurant_id,
      customer_id: order.customer_id,
      timestamp: new Date().toISOString()
    });
    
    // Notify customer
    await sendMessage(TOPICS.CUSTOMER_NOTIFICATION, {
      type: 'ORDER_STATUS_UPDATE',
      order_id: order._id,
      status: 'Preparing',
      customer_id: order.customer_id,
      timestamp: new Date().toISOString()
    });
    
    // Wait for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 3. UPDATE ORDER STATUS TO ON THE WAY
    console.log('\n3. UPDATING ORDER STATUS TO ON THE WAY...');
    await updateOrderStatus(order._id, 'Preparing', 'On the Way');
    
    // Send order updated event
    await sendMessage(TOPICS.ORDER_UPDATED, {
      order_id: order._id,
      previous_status: 'Preparing',
      new_status: 'On the Way',
      restaurant_id: order.restaurant_id,
      customer_id: order.customer_id,
      timestamp: new Date().toISOString()
    });
    
    // Notify customer
    await sendMessage(TOPICS.CUSTOMER_NOTIFICATION, {
      type: 'ORDER_STATUS_UPDATE',
      order_id: order._id,
      status: 'On the Way',
      customer_id: order.customer_id,
      timestamp: new Date().toISOString()
    });
    
    // Wait for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 4. UPDATE ORDER STATUS TO DELIVERED
    console.log('\n4. UPDATING ORDER STATUS TO DELIVERED...');
    await updateOrderStatus(order._id, 'On the Way', 'Delivered');
    
    // Send order updated event
    await sendMessage(TOPICS.ORDER_UPDATED, {
      order_id: order._id,
      previous_status: 'On the Way',
      new_status: 'Delivered',
      restaurant_id: order.restaurant_id,
      customer_id: order.customer_id,
      timestamp: new Date().toISOString()
    });
    
    // Notify customer
    await sendMessage(TOPICS.CUSTOMER_NOTIFICATION, {
      type: 'ORDER_STATUS_UPDATE',
      order_id: order._id,
      status: 'Delivered',
      customer_id: order.customer_id,
      timestamp: new Date().toISOString()
    });
    
    console.log('\nTest order flow completed successfully');
    console.log(`Order ID: ${order._id}`);
    console.log('Check the kafka-realtime.log file for the complete message flow');
    
    // Cleanup
    await disconnectAll();
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('Error in test order flow:', error);
    
    // Cleanup
    try {
      await disconnectAll();
      await mongoose.disconnect();
    } catch (err) {
      console.error('Error during cleanup:', err);
    }
  }
}

// Run the test
testOrderFlow(); 