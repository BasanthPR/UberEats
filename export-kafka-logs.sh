#!/bin/bash

# Create a directory for exported materials
mkdir -p kafka-demo-export

# Copy log files from the container to the host
echo "Exporting Kafka message flow logs..."
docker cp ubereats-backend:/app/logs/kafka-messages-demo.log kafka-demo-export/kafka-messages-demo.log
docker cp ubereats-backend:/app/logs/kafka-flow-diagram.txt kafka-demo-export/kafka-flow-diagram.txt

# Create a screenshot of the diagram
echo "Creating screenshots for report..."
echo "Kafka Message Flow Diagram" > kafka-demo-export/kafka-flow-diagram.md
echo '```' >> kafka-demo-export/kafka-flow-diagram.md
cat kafka-demo-export/kafka-flow-diagram.txt >> kafka-demo-export/kafka-flow-diagram.md
echo '```' >> kafka-demo-export/kafka-flow-diagram.md

echo "Kafka Message Log Excerpt" > kafka-demo-export/kafka-messages-excerpt.md
echo '```' >> kafka-demo-export/kafka-messages-excerpt.md
head -n 50 kafka-demo-export/kafka-messages-demo.log >> kafka-demo-export/kafka-messages-excerpt.md
echo '```' >> kafka-demo-export/kafka-messages-excerpt.md

echo "Export complete! Files are in the kafka-demo-export directory:"
ls -la kafka-demo-export/ 