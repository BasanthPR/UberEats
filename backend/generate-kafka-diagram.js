/**
 * Kafka Message Flow Diagram Generator
 * 
 * This script generates an ASCII diagram showing the Kafka message flow
 * between services in the UberEats application.
 */

const fs = require('fs');
const path = require('path');

// Create the diagram
const diagram = `
===================================================================================
                       UBER EATS KAFKA MESSAGE FLOW
===================================================================================

┌─────────────────┐                              ┌──────────────────┐
│                 │                              │                  │
│  Customer App   │                              │  Restaurant App  │
│                 │                              │                  │
└────────┬────────┘                              └────────┬─────────┘
         │                                                │
         │  1. Place Order                                │
         │  ───────────►  ┌─────────────────────┐         │
         │                │ Topic: order-created │         │
         │                └─────────┬───────────┘         │
         │                          │                     │
         │                          ▼                     │
         │                ┌────────────────────┐          │
         │                │                    │          │
         │                │   Order Service    │          │
         │                │                    │          │
         │                └──────────┬─────────┘          │
         │                           │                    │
         │                           │                    │
         │                           ▼                    │
         │               ┌──────────────────────┐         │
         │               │Topic:restaurant-notif│         │
         │               └──────────┬───────────┘         │
         │                          │                     │
         │                          │                     │
         │                          └────────────────────►│
         │                                                │ 2. Process Order
         │                                                │ ◄───────────────
         │                                                │
         │                             ┌─────────────────┐│
         │                             │Topic:order-updat││
         │                 ┌───────────┴─────────────────┘│
         │                 │                              │
         │                 │                              │
         │        ┌────────▼─────────┐                    │
         │        │                  │                    │
         │        │   Order Service  │                    │
         │        │                  │                    │
         │        └────────┬─────────┘                    │
         │                 │                              │
         │                 │                              │
         │     ┌───────────▼───────────────┐              │
         │     │Topic:customer-notification│              │
         │     └───────────┬───────────────┘              │
         │                 │                              │
         │                 │                              │
         ◄─────────────────┘                              │
  3. Receive Updates                                      │
                                                          │
===================================================================================
Message Flow Summary:
===================================================================================
1. Customer places order → order-created topic → Order Service processes
2. Order Service notifies restaurant → restaurant-notification topic → Restaurant App
3. Restaurant updates order → order-updated topic → Order Service
4. Order Service notifies customer → customer-notification topic → Customer App
===================================================================================
`;

// Write the diagram to a file
const diagramPath = path.join(__dirname, 'logs', 'kafka-flow-diagram.txt');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

fs.writeFileSync(diagramPath, diagram);
console.log(`Kafka message flow diagram generated at: ${diagramPath}`);
console.log('\nUBER EATS KAFKA MESSAGE FLOW DIAGRAM:');
console.log(diagram); 