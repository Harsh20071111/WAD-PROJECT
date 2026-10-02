const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getNotices, createNotice } = require('../controllers/noticeController');

router.use(protect);

router.get('/', getNotices);
router.post('/', createNotice);

module.exports = router;
