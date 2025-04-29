Kafka Message Log Excerpt
```
=== KAFKA MESSAGE FLOW DEMONSTRATION LOG ===
Started at: 2025-04-28T00:15:31.186Z


=== KAFKA MESSAGE FLOW DEMONSTRATION ===

Sample data loaded:
- Customer: John Doe (john@example.com)
- Restaurant: Pizza Palace (pizza@example.com)

Found 2 dishes for the restaurant

1. CREATING A NEW ORDER...
Created demo order ID: 680ec8a4d8743bfe21119076

[2025-04-28T00:15:32.943Z] PRODUCED | Topic: order-created
{
  "order_id": "680ec8a4d8743bfe21119076",
  "restaurant_id": "680b425d2e8f239b0c670207",
  "customer_id": "680b425c2e8f239b0c6701fd",
  "status": "placed",
  "timestamp": "2025-04-28T00:15:32.932Z"
}
================================================================================
[2025-04-28T00:15:32.946Z] PRODUCED | Topic: restaurant-notification
{
  "type": "NEW_ORDER",
  "order_id": "680ec8a4d8743bfe21119076",
  "restaurant_id": "680b425d2e8f239b0c670207",
  "timestamp": "2025-04-28T00:15:32.944Z"
}
================================================================================
4. UPDATING ORDER STATUS...
[2025-04-28T00:15:35.044Z] PRODUCED | Topic: order-updated
{
  "order_id": "680ec8a4d8743bfe21119076",
  "previous_status": "placed",
  "new_status": "Preparing",
  "restaurant_id": "680b425d2e8f239b0c670207",
  "customer_id": "680b425c2e8f239b0c6701fd",
  "timestamp": "2025-04-28T00:15:35.038Z"
}
================================================================================
[2025-04-28T00:15:35.052Z] PRODUCED | Topic: customer-notification
{
  "type": "ORDER_STATUS_UPDATE",
  "order_id": "680ec8a4d8743bfe21119076",
  "status": "Preparing",
  "customer_id": "680b425c2e8f239b0c6701fd",
  "timestamp": "2025-04-28T00:15:35.045Z"
```
