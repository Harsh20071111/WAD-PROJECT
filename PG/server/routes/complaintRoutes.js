const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const { uploadArray } = require('../middleware/uploadMiddleware');
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  reopenComplaint
} = require('../controllers/complaintController');

router.use(protect);

router.post('/', restrictTo('RESIDENT'), uploadArray, createComplaint);
router.get('/', getComplaints);
router.get('/:id', getComplaintById);
router.patch('/:id/status', restrictTo('STAFF', 'ADMIN'), updateComplaintStatus);
router.post('/:id/reopen', restrictTo('RESIDENT'), reopenComplaint);

module.exports = router;
