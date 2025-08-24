const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { adminAuth } = require('../middleware/auth');

// Получить все заказы (для админа)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Обновить статус заказа (для админа)
router.patch('/admin/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create order
router.post('/', async (req, res) => {
  try {
    const { customer, items } = req.body;

    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Продукт ${item.product} не найден` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Недостаточно товара ${product.name} на складе` });
      }
      totalAmount += product.price * item.quantity;
      
      product.stock -= item.quantity;
      await product.save();
    }

    const order = new Order({
      customer,
      items: items.map(item => ({
        ...item,
        price: item.price
      })),
      totalAmount,
      status: 'pending'
    });

    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user orders by email
router.get('/user/:email', async (req, res) => {
  try {
    const orders = await Order.find({ 'customer.email': req.params.email })
      .populate('items.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order status
router.get('/:id/status', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }
    res.json({ status: order.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;