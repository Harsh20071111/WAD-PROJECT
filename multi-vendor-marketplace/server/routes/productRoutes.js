const express = require('express');
const router = express.Router();
const {
  addProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getProductById
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const { uploadArray } = require('../middleware/uploadMiddleware');

// Seller routes
router.get('/my-products', protect, restrictTo('seller'), getMyProducts);
router.post('/', protect, restrictTo('seller'), uploadArray, addProduct);
router.put('/:id', protect, restrictTo('seller'), uploadArray, updateProduct);
router.delete('/:id', protect, restrictTo('seller'), deleteProduct);

// Public route
router.get('/:id', getProductById);

module.exports = router;
