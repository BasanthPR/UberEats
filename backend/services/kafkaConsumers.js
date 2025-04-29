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
          
          // Ensure the order in DB matches what's in the event
          const order = await Order.findById(messageValue.order_id);
          if (order && order.status !== messageValue.status) {
            order.status = messageValue.status;
            await order.save();
            console.log(`Order ${messageValue.order_id} status synchronized to '${messageValue.status}'`);
          }
          
        } else if (topic === TOPICS.ORDER_UPDATED) {
          // Handle order status update
          console.log(`ORDER UPDATED EVENT: Order ${messageValue.order_id} updated from ${messageValue.previous_status} to ${messageValue.new_status}`);
          
          // Ensure order status in DB is updated if needed
          const order = await Order.findById(messageValue.order_id);
          if (order && order.status !== messageValue.new_status) {
            order.status = messageValue.new_status;
            await order.save();
            console.log(`Order ${messageValue.order_id} status synchronized to '${messageValue.new_status}'`);
          }
          
          // Additional logic for specific status changes
          if (messageValue.new_status === 'Preparing' || messageValue.new_status === 'confirmed') {
            console.log(`Restaurant started preparing order ${messageValue.order_id}`);
          } else if (messageValue.new_status === 'On the Way' || messageValue.new_status === 'out_for_delivery') {
            console.log(`Order ${messageValue.order_id} is out for delivery`);
          } else if (messageValue.new_status === 'Delivered' || messageValue.new_status === 'delivered') {
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
          
          // We'll make sure the order is properly received
          const order = await Order.findById(messageValue.order_id);
          if (!order) {
            console.error(`Order ${messageValue.order_id} not found in the database!`);
            return;
          }
          
          console.log(`Restaurant ${messageValue.restaurant_id} received order ${messageValue.order_id}`);
          
          // Auto-confirm order after 15 seconds (for demo purposes)
          // This helps demonstrate the Kafka message flow
          setTimeout(async () => {
            try {
              const order = await Order.findById(messageValue.order_id);
              if (order && order.status === 'placed') {
                order.status = 'Preparing';
                await order.save();
                
                // Send order update event
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
                
                console.log(`Order ${order._id} auto-updated to 'Preparing'`);
                
                // After another 15 seconds, update to "On the Way"
                setTimeout(async () => {
                  try {
                    const updatedOrder = await Order.findById(messageValue.order_id);
                    if (updatedOrder && updatedOrder.status === 'Preparing') {
                      updatedOrder.status = 'On the Way';
                      await updatedOrder.save();
                      
                      // Send order update event
                      await sendMessage(TOPICS.ORDER_UPDATED, {
                        order_id: updatedOrder._id,
                        previous_status: 'Preparing',
                        new_status: 'On the Way',
                        restaurant_id: updatedOrder.restaurant_id,
                        customer_id: updatedOrder.customer_id,
                        timestamp: new Date().toISOString()
                      });
                      
                      // Notify customer
                      await sendMessage(TOPICS.CUSTOMER_NOTIFICATION, {
                        type: 'ORDER_STATUS_UPDATE',
                        order_id: updatedOrder._id,
                        status: 'On the Way',
                        customer_id: updatedOrder.customer_id,
                        timestamp: new Date().toISOString()
                      });
                      
                      console.log(`Order ${updatedOrder._id} auto-updated to 'On the Way'`);
                    }
                  } catch (error) {
                    console.error('Error updating order status:', error);
                  }
                }, 15000); // 15 seconds
              }
            } catch (error) {
              console.error('Error auto-confirming order:', error);
            }
          }, 15000); // 15 seconds
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
          console.log(`Order status update notification for customer ${messageValue.customer_id}: Order ${messageValue.order_id} status is now '${messageValue.status}'`);
          
          // Here you would typically:
          // - Send push notification to customer app
          // - Update customer UI in real-time
          
          // Check if order exists and status matches
          const order = await Order.findById(messageValue.order_id);
          if (order && order.status !== messageValue.status) {
            order.status = messageValue.status;
            await order.save();
            console.log(`Order ${messageValue.order_id} status synchronized to '${messageValue.status}'`);
          }
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