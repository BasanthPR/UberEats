const Order = require('../models/Order');
const { Customer, Restaurant } = require('../models/User');
const { sendMessage, TOPICS } = require('../config/kafka');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { 
      restaurant_id, 
      items, 
      total_amount, 
      delivery_fee, 
      delivery_address, 
      payment_method,
      order_notes 
    } = req.body;

    // Get customer ID from the authenticated user
    const customerId = req.session.user.id;

    // Validate customer exists
    const customer = await Customer.findOne({ user: customerId });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Create new order
    const newOrder = new Order({
      customer_id: customer._id,
      restaurant_id,
      items,
      status: 'placed',
      total_amount,
      delivery_fee,
      delivery_address: delivery_address || customer.address,
      payment_method,
      order_notes
    });

    // Save order to database
    const savedOrder = await newOrder.save();

    // Send order created event to Kafka
    await sendMessage(TOPICS.ORDER_CREATED, {
      order_id: savedOrder._id,
      restaurant_id: savedOrder.restaurant_id,
      customer_id: savedOrder.customer_id,
      status: savedOrder.status,
      timestamp: new Date().toISOString()
    });

    // Notify restaurant about new order
    await sendMessage(TOPICS.RESTAURANT_NOTIFICATION, {
      type: 'NEW_ORDER',
      order_id: savedOrder._id,
      restaurant_id: savedOrder.restaurant_id,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: savedOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('restaurant_id', 'name phone address')
      .populate('customer_id', 'name phone');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if user is authorized to view this order
    const customerId = req.session.user.id;
    const customer = await Customer.findOne({ user: customerId });
    
    if (order.customer_id._id.toString() !== customer._id.toString() && 
        req.session.user.role !== 'restaurant' && 
        req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const validStatuses = [
      'placed', 
      'Order Received', 
      'Preparing', 
      'On the Way', 
      'Pick-up Ready', 
      'Delivered', 
      'Picked Up', 
      'Cancelled', 
      'confirmed', 
      'ready_for_pickup', 
      'out_for_delivery'
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Store previous status for notification
    const previousStatus = order.status;
    
    // Update order status
    order.status = status;
    const updatedOrder = await order.save();
    
    // Send order updated event to Kafka
    await sendMessage(TOPICS.ORDER_UPDATED, {
      order_id: updatedOrder._id,
      previous_status: previousStatus,
      new_status: updatedOrder.status,
      restaurant_id: updatedOrder.restaurant_id,
      customer_id: updatedOrder.customer_id,
      timestamp: new Date().toISOString()
    });
    
    // Notify customer about order status update
    await sendMessage(TOPICS.CUSTOMER_NOTIFICATION, {
      type: 'ORDER_STATUS_UPDATE',
      order_id: updatedOrder._id,
      status: updatedOrder.status,
      customer_id: updatedOrder.customer_id,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get customer orders
exports.getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.session.user.id;
    
    // Get customer document from User reference
    const customer = await Customer.findOne({ user: customerId });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Only fetch non-archived orders
    const orders = await Order.find({ 
      customer_id: customer._id,
      archived: { $ne: true }
    })
      .populate('restaurant_id', 'name address')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error getting customer orders:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get restaurant orders
exports.getRestaurantOrders = async (req, res) => {
  try {
    const restaurantId = req.session.user.id;
    const { status } = req.query;
    
    // Find the restaurant
    const restaurant = await Restaurant.findOne({ user: restaurantId });
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    // Build query with proper filters
    let query = { 
      restaurant_id: restaurant._id,
      archived: { $ne: true } // Exclude archived orders
    };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('customer_id', 'name address')
      .sort({ createdAt: -1 });
    
    // Add sequential order number for display
    const ordersWithNumbers = orders.map((order, index) => ({
      ...order.toObject(),
      orderNumber: index + 1
    }));
    
    res.json(ordersWithNumbers);
  } catch (error) {
    console.error('Error getting restaurant orders:', error);
    res.status(500).json({ error: error.message });
  }
};

// Archive completed orders
exports.clearCompletedOrders = async (req, res) => {
  try {
    const restaurantId = req.session.user.id;
    
    // Find the restaurant
    const restaurant = await Restaurant.findOne({ user: restaurantId });
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    // Find completed orders (Delivered, Picked Up, Cancelled)
    const completedOrders = await Order.find({
      restaurant_id: restaurant._id,
      status: { $in: ['Delivered', 'Picked Up', 'Cancelled'] },
      archived: { $ne: true }
    });
    
    if (completedOrders.length === 0) {
      return res.json({ message: 'No completed orders to archive' });
    }
    
    // Archive the orders (mark them as archived)
    const orderIds = completedOrders.map(order => order._id);
    await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { archived: true } }
    );
    
    res.json({ 
      message: `Successfully archived ${completedOrders.length} completed orders`,
      count: completedOrders.length
    });
  } catch (error) {
    console.error('Error archiving completed orders:', error);
    res.status(500).json({ error: error.message });
  }
}; 