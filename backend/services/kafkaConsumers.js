const { 
  orderConsumer, 
  restaurantConsumer, 
  notificationConsumer,
  TOPICS,
  sendMessage,
  logKafkaMessage
} = require('../config/kafka');
const Order = require('../models/Order');

// Start the order consumer
const startOrderConsumer = async () => {
  await orderConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const messageValue = JSON.parse(message.value.toString());
        
        // Log the received message
        logKafkaMessage('CONSUMED', topic, messageValue);

        if (topic === TOPICS.ORDER_CREATED) {
          // Handle new order creation
          console.log(`ORDER CREATED EVENT: New order created: ${messageValue.order_id}`);
          
          // You can add additional logic here, such as:
          // - Updating analytics
          // - Logging order creation
          // - Triggering other workflows
          
        } else if (topic === TOPICS.ORDER_UPDATED) {
          // Handle order status update
          console.log(`ORDER UPDATED EVENT: Order ${messageValue.order_id} updated from ${messageValue.previous_status} to ${messageValue.new_status}`);
          
          // Additional logic for status changes
          if (messageValue.new_status === 'confirmed') {
            // Logic for confirmed orders
            console.log(`Order ${messageValue.order_id} has been confirmed by restaurant`);
          } else if (messageValue.new_status === 'delivered') {
            // Logic for delivered orders
            console.log(`Order ${messageValue.order_id} has been delivered`);
          }
        }
      } catch (error) {
        console.error('Error processing order message:', error);
      }
    }
  });
  console.log('Order consumer started');
};

// Start the restaurant consumer
const startRestaurantConsumer = async () => {
  await restaurantConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const messageValue = JSON.parse(message.value.toString());
        
        // Log the received message
        logKafkaMessage('CONSUMED', topic, messageValue);

        if (messageValue.type === 'NEW_ORDER') {
          // Logic for notifying restaurant about new order
          console.log(`New order notification for restaurant ${messageValue.restaurant_id}`);
          
          // Here you would typically:
          // - Send push notification to restaurant dashboard
          // - Update restaurant UI in real-time
          // - Potentially send SMS/email to restaurant
          
          // Auto-confirm order after 30 seconds (for demo purposes)
          setTimeout(async () => {
            try {
              const order = await Order.findById(messageValue.order_id);
              if (order && order.status === 'placed') {
                order.status = 'confirmed';
                await order.save();
                
                // Send order update event
                await sendMessage(TOPICS.ORDER_UPDATED, {
                  order_id: order._id,
                  previous_status: 'placed',
                  new_status: 'confirmed',
                  restaurant_id: order.restaurant_id,
                  customer_id: order.customer_id,
                  timestamp: new Date().toISOString()
                });
                
                // Notify customer
                await sendMessage(TOPICS.CUSTOMER_NOTIFICATION, {
                  type: 'ORDER_STATUS_UPDATE',
                  order_id: order._id,
                  status: 'confirmed',
                  customer_id: order.customer_id,
                  timestamp: new Date().toISOString()
                });
                
                console.log(`Order ${order._id} auto-confirmed`);
              }
            } catch (error) {
              console.error('Error auto-confirming order:', error);
            }
          }, 30000); // 30 seconds
        }
      } catch (error) {
        console.error('Error processing restaurant message:', error);
      }
    }
  });
  console.log('Restaurant consumer started');
};

// Start the notification consumer
const startNotificationConsumer = async () => {
  await notificationConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const messageValue = JSON.parse(message.value.toString());
        
        // Log the received message
        logKafkaMessage('CONSUMED', topic, messageValue);

        if (messageValue.type === 'ORDER_STATUS_UPDATE') {
          // Logic for notifying customer about order status updates
          console.log(`Order status update notification for customer ${messageValue.customer_id}`);
          
          // Here you would typically:
          // - Send push notification to customer app
          // - Update customer UI in real-time
          // - Potentially send SMS/email to customer
        }
      } catch (error) {
        console.error('Error processing notification message:', error);
      }
    }
  });
  console.log('Notification consumer started');
};

// Start all consumers
const startAllConsumers = async () => {
  try {
    await startOrderConsumer();
    await startRestaurantConsumer();
    await startNotificationConsumer();
    console.log('All Kafka consumers started successfully');
  } catch (error) {
    console.error('Error starting Kafka consumers:', error);
    throw error;
  }
};

module.exports = {
  startAllConsumers
}; 