const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const { getMe, getDues } = require('../controllers/residentController');

router.use(protect);

router.get('/me', restrictTo('RESIDENT'), getMe);
router.get('/dues', restrictTo('RESIDENT'), getDues);

module.exports = router;
