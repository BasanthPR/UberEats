const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create log file path for real-time logging
const kafkaRealtimeLogFile = path.join(logsDir, 'kafka-realtime.log');

// Initialize log file with header
const initRealtimeLog = () => {
  fs.writeFileSync(kafkaRealtimeLogFile, `=== KAFKA REALTIME MESSAGE LOG ===\nStarted at: ${new Date().toISOString()}\n\n`);
};

// Function to log Kafka messages to file and console
const logRealtimeMessage = (type, topic, message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${type} | Topic: ${topic}\n${JSON.stringify(message, null, 2)}\n\n`;
  
  // Log to file
  fs.appendFileSync(kafkaRealtimeLogFile, logEntry);
  
  // Log to console
  console.log(`KAFKA ${type}: ${topic}`, JSON.stringify(message));
};

module.exports = {
  initRealtimeLog,
  logRealtimeMessage
}; 