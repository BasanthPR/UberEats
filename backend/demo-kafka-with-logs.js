/**
 * Kafka Message Flow Demonstration with Direct Logging
 * 
 * This script demonstrates the complete Kafka message flow in the UberEats app
 * and logs all messages directly to a file for easy review.
 */

const fs = require('fs');
const path = require('path');
const { connectAll, disconnectAll, sendMessage, TOPICS } = require('./config/kafka');
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const Order = require('./models/Order');
const { Customer, Restaurant } = require('./models/User');
const Dish = require('./models/Dish');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create log file with header
const logFile = path.join(logsDir, 'kafka-messages-demo.log');
fs.writeFileSync(logFile, `=== KAFKA MESSAGE FLOW DEMONSTRATION LOG ===\nStarted at: ${new Date().toISOString()}\n\n`);

// Helper function to log messages
const logMessage = (type, topic, message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${type} | Topic: ${topic}\n${JSON.stringify(message, null, 2)}\n${'='.repeat(80)}\n`;
  fs.appendFileSync(logFile, logEntry);
  console.log(`${type}: ${topic}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function demonstrateKafkaFlow() {
  try {
    console.log('\n=== KAFKA MESSAGE FLOW DEMONSTRATION ===\n');
    fs.appendFileSync(logFile, '\n=== KAFKA MESSAGE FLOW DEMONSTRATION ===\n\n');
    
    // 1. Connect to MongoDB and Kafka
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    console.log('Connecting to Kafka...');
    await connectAll();
    
    // 2. Find a sample customer and restaurant
    const customer = await Customer.findOne().populate('user');
    const restaurant = await Restaurant.findOne().populate('user');
    
    if (!customer || !restaurant) {
      console.error('Could not find sample customer or restaurant in database.');
      fs.appendFileSync(logFile, 'ERROR: Could not find sample customer or restaurant in database.\n');
      await disconnectAll();
      await mongoose.connection.close();
      return;
    }
    
    console.log(`\nSample data loaded:`);
    console.log(`- Customer: ${customer.user.name} (${customer.user.email})`);
    console.log(`- Restaurant: ${restaurant.user.name} (${restaurant.user.email})`);
    
    fs.appendFileSync(logFile, `Sample data loaded:\n- Customer: ${customer.user.name} (${customer.user.email})\n- Restaurant: ${restaurant.user.name} (${restaurant.user.email})\n\n`);
    
    // Find some dishes for the restaurant
    const dishes = await Dish.find({ restaurant_id: restaurant._id }).limit(2);
    
    if (dishes.length < 1) {
      console.log('Creating sample dishes for the restaurant...');
      fs.appendFileSync(logFile, 'Creating sample dishes for the restaurant...\n');
      
      // Create sample dishes if none exist
      const sampleDishes = [
        {
          restaurant_id: restaurant._id,
          name: 'Demo Pizza',
          description: 'A delicious demo pizza',
          price: 12.99,
          category: 'Pizza',
          available: true
        },
        {
          restaurant_id: restaurant._id,
          name: 'Demo Soda',
          description: 'A refreshing demo soda',
          price: 2.99,
          category: 'Drinks',
          available: true
        }
      ];
      
      const createdDishes = await Dish.insertMany(sampleDishes);
      console.log(`Created ${createdDishes.length} sample dishes`);
      fs.appendFileSync(logFile, `Created ${createdDishes.length} sample dishes\n`);
      dishes.push(...createdDishes);
    }
    
    console.log(`Found ${dishes.length} dishes for the restaurant`);
    fs.appendFileSync(logFile, `Found ${dishes.length} dishes for the restaurant\n\n`);
    
    // 3. Create a demo order
    console.log('\n1. CREATING A NEW ORDER...');
    fs.appendFileSync(logFile, '1. CREATING A NEW ORDER...\n');
    
    const orderItems = dishes.map(dish => ({
      dish_id: dish._id,
      name: dish.name,
      quantity: 1,
      price: dish.price
    }));
    
    // Calculate total amount
    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 3.99;
    
    const demoOrder = new Order({
      customer_id: customer._id,
      restaurant_id: restaurant._id,
      items: orderItems,
      status: 'placed',
      total_amount: totalAmount,
      delivery_fee: 3.99,
      delivery_address: {
        street: '123 Demo Street',
        city: 'Demo City',
        state: 'DS',
        country: 'USA',
        zip_code: '12345'
      },
      payment_method: 'card',
      delivery_time_estimate: '30-45 min'
    });
    
    await demoOrder.save();
    console.log(`Created demo order ID: ${demoOrder._id}`);
    fs.appendFileSync(logFile, `Created demo order ID: ${demoOrder._id}\n\n`);
    
    // 4. Send ORDER_CREATED event
    console.log('\n2. SENDING ORDER_CREATED EVENT...');
    const orderCreatedMsg = {
      order_id: demoOrder._id,
      restaurant_id: demoOrder.restaurant_id,
      customer_id: demoOrder.customer_id,
      status: demoOrder.status,
      timestamp: new Date().toISOString()
    };
    
    await sendMessage(TOPICS.ORDER_CREATED, orderCreatedMsg);
    logMessage('PRODUCED', TOPICS.ORDER_CREATED, orderCreatedMsg);
    
    // 5. Send RESTAURANT_NOTIFICATION event
    console.log('\n3. SENDING RESTAURANT_NOTIFICATION EVENT...');
    const restaurantNotifMsg = {
      type: 'NEW_ORDER',
      order_id: demoOrder._id,
      restaurant_id: demoOrder.restaurant_id,
      timestamp: new Date().toISOString()
    };
    
    await sendMessage(TOPICS.RESTAURANT_NOTIFICATION, restaurantNotifMsg);
    logMessage('PRODUCED', TOPICS.RESTAURANT_NOTIFICATION, restaurantNotifMsg);
    
    // Wait a bit to simulate restaurant processing
    await sleep(2000);
    
    // 6. Update order status
    console.log('\n4. UPDATING ORDER STATUS...');
    fs.appendFileSync(logFile, '4. UPDATING ORDER STATUS...\n');
    
    demoOrder.status = 'Preparing';
    await demoOrder.save();
    
    // 7. Send ORDER_UPDATED event
    console.log('\n5. SENDING ORDER_UPDATED EVENT...');
    const orderUpdatedMsg = {
      order_id: demoOrder._id,
      previous_status: 'placed',
      new_status: 'Preparing',
      restaurant_id: demoOrder.restaurant_id,
      customer_id: demoOrder.customer_id,
      timestamp: new Date().toISOString()
    };
    
    await sendMessage(TOPICS.ORDER_UPDATED, orderUpdatedMsg);
    logMessage('PRODUCED', TOPICS.ORDER_UPDATED, orderUpdatedMsg);
    
    // 8. Send CUSTOMER_NOTIFICATION event
    console.log('\n6. SENDING CUSTOMER_NOTIFICATION EVENT...');
    const customerNotifMsg = {
      type: 'ORDER_STATUS_UPDATE',
      order_id: demoOrder._id,
      status: 'Preparing',
      customer_id: demoOrder.customer_id,
      timestamp: new Date().toISOString()
    };
    
    await sendMessage(TOPICS.CUSTOMER_NOTIFICATION, customerNotifMsg);
    logMessage('PRODUCED', TOPICS.CUSTOMER_NOTIFICATION, customerNotifMsg);
    
    // Final status update to complete the flow
    await sleep(2000);
    console.log('\n7. FINAL STATUS UPDATE - ORDER DELIVERED...');
    fs.appendFileSync(logFile, '7. FINAL STATUS UPDATE - ORDER DELIVERED...\n');
    
    demoOrder.status = 'Delivered';
    await demoOrder.save();
    
    const finalOrderUpdateMsg = {
      order_id: demoOrder._id,
      previous_status: 'Preparing',
      new_status: 'Delivered',
      restaurant_id: demoOrder.restaurant_id,
      customer_id: demoOrder.customer_id,
      timestamp: new Date().toISOString()
    };
    
    await sendMessage(TOPICS.ORDER_UPDATED, finalOrderUpdateMsg);
    logMessage('PRODUCED', TOPICS.ORDER_UPDATED, finalOrderUpdateMsg);
    
    const finalCustomerNotifMsg = {
      type: 'ORDER_STATUS_UPDATE',
      order_id: demoOrder._id,
      status: 'Delivered',
      customer_id: demoOrder.customer_id,
      timestamp: new Date().toISOString()
    };
    
    await sendMessage(TOPICS.CUSTOMER_NOTIFICATION, finalCustomerNotifMsg);
    logMessage('PRODUCED', TOPICS.CUSTOMER_NOTIFICATION, finalCustomerNotifMsg);
    
    // Clean up
    console.log('\nDemo completed! All Kafka messages have been logged.');
    console.log(`Log file location: ${logFile}`);
    fs.appendFileSync(logFile, '\nDemo completed successfully!\n');
    
    await sleep(1000);
    await disconnectAll();
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Error in Kafka flow demonstration:', error);
    fs.appendFileSync(logFile, `\nERROR: ${error.message}\n${error.stack}\n`);
    
    await disconnectAll();
    await mongoose.connection.close();
  }
}

// Run the demonstration
demonstrateKafkaFlow(); 