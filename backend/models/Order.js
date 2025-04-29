const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  dish_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish',
    required: true
  },
  name: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: [
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
    ],
    default: 'placed'
  },
  total_amount: {
    type: Number,
    required: true
  },
  delivery_fee: Number,
  delivery_address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zip_code: String
  },
  payment_method: {
    type: String,
    enum: ['card', 'cash']
  },
  delivery_time_estimate: String,
  order_notes: String,
  archived: {
    type: Boolean,
    default: false
  },
  orderNumber: Number
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema); 