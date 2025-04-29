const { Kafka } = require('kafkajs');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create log file path
const kafkaLogFile = path.join(logsDir, 'kafka-messages.log');

// Initialize log file with header
fs.writeFileSync(kafkaLogFile, `=== KAFKA MESSAGE FLOW LOG ===\nStarted at: ${new Date().toISOString()}\n\n`);

// Initialize Kafka client
const kafka = new Kafka({
  clientId: 'ubereats-app',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

// Create admin client
const admin = kafka.admin();

// Create producer
const producer = kafka.producer();

// Create consumers
const orderConsumer = kafka.consumer({ groupId: 'order-service-group' });
const restaurantConsumer = kafka.consumer({ groupId: 'restaurant-service-group' });
const notificationConsumer = kafka.consumer({ groupId: 'notification-service-group' });

// Topics
const TOPICS = {
  ORDER_CREATED: 'order-created',
  ORDER_UPDATED: 'order-updated',
  RESTAURANT_NOTIFICATION: 'restaurant-notification',
  CUSTOMER_NOTIFICATION: 'customer-notification'
};

// Function to log Kafka messages to file and console
const logKafkaMessage = (type, topic, message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${type} | Topic: ${topic} | ${JSON.stringify(message, null, 2)}\n${'='.repeat(80)}\n`;
  
  // Log to file
  fs.appendFileSync(kafkaLogFile, logEntry);
  
  // Log to console
  console.log(`KAFKA ${type}: ${topic}`, JSON.stringify(message));
};

// Connect all Kafka clients
const connectAll = async () => {
  try {
    // Connect to admin client
    await admin.connect();
    console.log('Kafka Admin connected');
    
    // Create topics if they don't exist
    const existingTopics = await admin.listTopics();
    const topicsToCreate = Object.values(TOPICS).filter(topic => !existingTopics.includes(topic));
    
    if (topicsToCreate.length > 0) {
      await admin.createTopics({
        topics: topicsToCreate.map(topic => ({
          topic,
          numPartitions: 1,
          replicationFactor: 1
        })),
        waitForLeaders: true
      });
      console.log(`Created Kafka topics: ${topicsToCreate.join(', ')}`);
    }
    
    // Connect producer
    await producer.connect();
    console.log('Kafka Producer connected');
    
    // Connect and subscribe consumers
    await orderConsumer.connect();
    await orderConsumer.subscribe({ topics: [TOPICS.ORDER_CREATED, TOPICS.ORDER_UPDATED] });
    console.log('Order Consumer connected and subscribed');
    
    await restaurantConsumer.connect();
    await restaurantConsumer.subscribe({ topic: TOPICS.RESTAURANT_NOTIFICATION });
    console.log('Restaurant Consumer connected and subscribed');
    
    await notificationConsumer.connect();
    await notificationConsumer.subscribe({ topic: TOPICS.CUSTOMER_NOTIFICATION });
    console.log('Notification Consumer connected and subscribed');
    
    return true;
  } catch (error) {
    console.error('Error connecting to Kafka:', error);
    return false;
  }
};

// Disconnect all Kafka clients
const disconnectAll = async () => {
  try {
    await producer.disconnect();
    await orderConsumer.disconnect();
    await restaurantConsumer.disconnect();
    await notificationConsumer.disconnect();
    await admin.disconnect();
    console.log('All Kafka clients disconnected');
  } catch (error) {
    console.error('Error disconnecting Kafka clients:', error);
  }
};

// Send message to a topic
const sendMessage = async (topic, message) => {
  try {
    // Log the message before sending
    logKafkaMessage('PRODUCED', topic, message);
    
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }]
    });
    
    console.log(`SUCCESS: Message sent to topic ${topic}`);
    return true;
  } catch (error) {
    console.error(`ERROR: Failed sending message to topic ${topic}:`, error);
    return false;
  }
};

module.exports = {
  kafka,
  producer,
  admin,
  orderConsumer,
  restaurantConsumer,
  notificationConsumer,
  TOPICS,
  connectAll,
  disconnectAll,
  sendMessage,
  logKafkaMessage
}; 