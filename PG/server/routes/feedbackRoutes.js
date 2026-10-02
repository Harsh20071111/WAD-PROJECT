const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const { submitFeedback, getStaffRatings } = require('../controllers/feedbackController');

router.use(protect);

router.post('/', restrictTo('RESIDENT'), submitFeedback);
router.get('/staff-ratings', restrictTo('ADMIN'), getStaffRatings);

module.exports = router;
