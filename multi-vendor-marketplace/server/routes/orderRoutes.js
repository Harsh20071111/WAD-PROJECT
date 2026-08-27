const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getShopOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

// Buyer order routes
router.post('/', protect, restrictTo('buyer'), placeOrder);
router.get('/my-orders', protect, restrictTo('buyer'), getMyOrders);

// Seller order routes
router.get('/shop-orders', protect, restrictTo('seller'), getShopOrders);
router.put('/:id/status', protect, restrictTo('seller'), updateOrderStatus);

module.exports = router;
