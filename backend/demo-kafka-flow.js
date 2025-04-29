/**
 * Kafka Message Flow Demonstration
 * 
 * This script demonstrates the complete Kafka message flow in the UberEats app:
 * 1. Order Creation
 * 2. Restaurant Notification
 * 3. Order Status Update
 * 4. Customer Notification
 * 
 * Run with: node demo-kafka-flow.js
 */

const { connectAll, disconnectAll, sendMessage, TOPICS } = require('./config/kafka');
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const Order = require('./models/Order');
const { Customer, Restaurant } = require('./models/User');
const Dish = require('./models/Dish');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function demonstrateKafkaFlow() {
  try {
    console.log('\n=== KAFKA MESSAGE FLOW DEMONSTRATION ===\n');
    
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
      await disconnectAll();
      await mongoose.connection.close();
      return;
    }
    
    console.log(`\nSample data loaded:`);
    console.log(`- Customer: ${customer.user.name} (${customer.user.email})`);
    console.log(`- Restaurant: ${restaurant.user.name} (${restaurant.user.email})`);
    
    // Find some dishes for the restaurant
    const dishes = await Dish.find({ restaurant_id: restaurant._id }).limit(2);
    
    if (dishes.length < 1) {
      console.log('Creating sample dishes for the restaurant...');
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
      dishes.push(...createdDishes);
    }
    
    console.log(`Found ${dishes.length} dishes for the restaurant`);
    
    // 3. Create a demo order
    console.log('\n1. CREATING A NEW ORDER...');
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
    
    // 4. Send ORDER_CREATED event
    console.log('\n2. SENDING ORDER_CREATED EVENT...');
    await sendMessage(TOPICS.ORDER_CREATED, {
      order_id: demoOrder._id,
      restaurant_id: demoOrder.restaurant_id,
      customer_id: demoOrder.customer_id,
      status: demoOrder.status,
      timestamp: new Date().toISOString()
    });
    
    // 5. Send RESTAURANT_NOTIFICATION event
    console.log('\n3. SENDING RESTAURANT_NOTIFICATION EVENT...');
    await sendMessage(TOPICS.RESTAURANT_NOTIFICATION, {
      type: 'NEW_ORDER',
      order_id: demoOrder._id,
      restaurant_id: demoOrder.restaurant_id,
      timestamp: new Date().toISOString()
    });
    
    // Wait a bit to simulate restaurant processing
    await sleep(2000);
    
    // 6. Update order status
    console.log('\n4. UPDATING ORDER STATUS...');
    demoOrder.status = 'Preparing';
    await demoOrder.save();
    
    // 7. Send ORDER_UPDATED event
    console.log('\n5. SENDING ORDER_UPDATED EVENT...');
    await sendMessage(TOPICS.ORDER_UPDATED, {
      order_id: demoOrder._id,
      previous_status: 'placed',
      new_status: 'Preparing',
      restaurant_id: demoOrder.restaurant_id,
      customer_id: demoOrder.customer_id,
      timestamp: new Date().toISOString()
    });
    
    // 8. Send CUSTOMER_NOTIFICATION event
    console.log('\n6. SENDING CUSTOMER_NOTIFICATION EVENT...');
    await sendMessage(TOPICS.CUSTOMER_NOTIFICATION, {
      type: 'ORDER_STATUS_UPDATE',
      order_id: demoOrder._id,
      status: 'Preparing',
      customer_id: demoOrder.customer_id,
      timestamp: new Date().toISOString()
    });
    
    // Final status update to complete the flow
    await sleep(2000);
    console.log('\n7. FINAL STATUS UPDATE - ORDER DELIVERED...');
    
    demoOrder.status = 'Delivered';
    await demoOrder.save();
    
    await sendMessage(TOPICS.ORDER_UPDATED, {
      order_id: demoOrder._id,
      previous_status: 'Preparing',
      new_status: 'Delivered',
      restaurant_id: demoOrder.restaurant_id,
      customer_id: demoOrder.customer_id,
      timestamp: new Date().toISOString()
    });
    
    await sendMessage(TOPICS.CUSTOMER_NOTIFICATION, {
      type: 'ORDER_STATUS_UPDATE',
      order_id: demoOrder._id,
      status: 'Delivered',
      customer_id: demoOrder.customer_id,
      timestamp: new Date().toISOString()
    });
    
    // Clean up
    console.log('\nDemo completed. Check kafka-messages.log for full message flow.');
    console.log('To view logs, run: node viewKafkaLogs.js');
    
    await sleep(1000);
    await disconnectAll();
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Error in Kafka flow demonstration:', error);
    await disconnectAll();
    await mongoose.connection.close();
  }
}

// Run the demonstration
demonstrateKafkaFlow(); 