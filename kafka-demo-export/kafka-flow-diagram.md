Kafka Message Flow Diagram
```

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
```
