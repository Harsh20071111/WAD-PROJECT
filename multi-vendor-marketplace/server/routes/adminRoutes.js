const express = require('express');
const router = express.Router();
const {
  listPendingShops,
  listAllShops,
  approveShop,
  rejectShop,
  getCategories,
  createCategory,
  deleteCategory,
  listAllOrders,
  getAdminStats
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

// All admin routes protected with protect and restrictTo('admin')
router.use(protect, restrictTo('admin'));

router.get('/stats', getAdminStats);
router.get('/shops/pending', listPendingShops);
router.get('/shops', listAllShops);
router.put('/shops/:id/approve', approveShop);
router.put('/shops/:id/reject', rejectShop);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);
router.get('/orders', listAllOrders);

module.exports = router;
