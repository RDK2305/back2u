const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getClaimMessages,
  getUserMessages,
  getUnreadCount,
  markMessageAsRead,
  deleteMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// IMPORTANT: Specific routes must come BEFORE parameterized routes
// Protected routes (require authentication)
router.get('/unread/count', protect, getUnreadCount);
router.get('/inbox', protect, getUserMessages);
router.get('/claim/:claimId', protect, getClaimMessages);
router.post('/', protect, sendMessage);
router.put('/:id/read', protect, markMessageAsRead);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
