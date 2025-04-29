// Test script for Kafka
const { sendMessage, TOPICS, connectAll, disconnectAll } = require('./config/kafka');

// Test function to send a message to Kafka
async function testKafka() {
  try {
    console.log('Connecting to Kafka...');
    await connectAll();
    
    console.log('Sending test message to Kafka...');
    const testMessage = {
      test_id: new Date().toISOString(),
      message: 'This is a test message',
      timestamp: new Date().toISOString()
    };
    
    await sendMessage(TOPICS.ORDER_CREATED, testMessage);
    
    console.log('Test complete, disconnecting...');
    await disconnectAll();
  } catch (error) {
    console.error('Error in Kafka test:', error);
  }
}

// Run the test
testKafka(); 