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

/**
 * Log Kafka message to file and console
 * @param {string} type - Type of event (PRODUCED, CONSUMED)
 * @param {string} topic - Kafka topic
 * @param {object} message - Message payload
 */
const logKafkaMessage = (type, topic, message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${type} | Topic: ${topic} | ${JSON.stringify(message, null, 2)}\n${'='.repeat(80)}\n`;
  
  // Log to file
  fs.appendFileSync(kafkaLogFile, logEntry);
  
  // Log to console
  console.log(`KAFKA ${type}: ${topic}`, message);
};

module.exports = {
  logKafkaMessage
}; 