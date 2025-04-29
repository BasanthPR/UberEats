const fs = require('fs');
const path = require('path');

// Get the log file path
const logFilePath = path.join(__dirname, 'logs', 'kafka-messages.log');

// Check if log file exists
if (!fs.existsSync(logFilePath)) {
  console.log('Kafka message log file does not exist yet.');
  process.exit(0);
}

// Read the log file
const logContent = fs.readFileSync(logFilePath, 'utf8');

// Print the log content
console.log('====================================');
console.log('      KAFKA MESSAGE FLOW LOGS      ');
console.log('====================================');
console.log(logContent);

// Set up a watcher to show new logs as they come in
console.log('\nWatching for new Kafka messages... (Press Ctrl+C to exit)');
fs.watchFile(logFilePath, { interval: 1000 }, (curr, prev) => {
  if (curr.size > prev.size) {
    // Read only the new content
    const fd = fs.openSync(logFilePath, 'r');
    const buffer = Buffer.alloc(curr.size - prev.size);
    fs.readSync(fd, buffer, 0, buffer.length, prev.size);
    fs.closeSync(fd);
    
    // Print new content
    process.stdout.write(buffer.toString());
  }
}); 