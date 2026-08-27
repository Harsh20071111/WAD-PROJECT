const express = require('express');
const router = express.Router();
const {
  createShop,
  updateShop,
  getMyShop,
  getShopById,
  listApprovedShops
} = require('../controllers/shopController');
const { getProductsByShop } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', listApprovedShops);

// Seller routes (must be above /:id to avoid collision with /my-shop)
router.get('/my-shop', protect, restrictTo('seller'), getMyShop);
router.post('/', protect, restrictTo('seller'), uploadSingle, createShop);
router.put('/my-shop', protect, restrictTo('seller'), uploadSingle, updateShop);

// Public nested products route: isolation boundary
router.get('/:shopId/products', getProductsByShop);

// Public get single shop
router.get('/:id', getShopById);

module.exports = router;
