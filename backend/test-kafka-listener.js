// Test script for Kafka listener
const { kafka, TOPICS, connectAll } = require('./config/kafka');

async function testListener() {
  try {
    console.log('Connecting to Kafka...');
    await connectAll();
    
    // Create a separate consumer for testing
    const testConsumer = kafka.consumer({ groupId: 'test-consumer-group' });
    await testConsumer.connect();
    
    // Subscribe to all topics
    const allTopics = Object.values(TOPICS);
    await testConsumer.subscribe({ topics: allTopics });
    console.log(`Subscribed to topics: ${allTopics.join(', ')}`);
    
    // Start listening
    console.log('Starting to listen for messages...');
    console.log('Press Ctrl+C to exit');
    
    await testConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const messageValue = JSON.parse(message.value.toString());
          console.log(`\n=== New Message ===`);
          console.log(`Topic: ${topic}`);
          console.log(`Message: ${JSON.stringify(messageValue, null, 2)}`);
          console.log(`================`);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      }
    });
  } catch (error) {
    console.error('Error in Kafka listener test:', error);
  }
}

// Run the test
testListener(); 