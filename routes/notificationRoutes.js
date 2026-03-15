const express = require('express');
const router = express.Router();
const {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationsByType
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// IMPORTANT: Specific routes must come BEFORE parameterized routes
// Protected routes (require authentication)
router.get('/unread/count', protect, getUnreadCount);
router.put('/mark-all/read', protect, markAllAsRead);
router.get('/type/:type', protect, getNotificationsByType);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);
router.get('/', protect, getUserNotifications);

// Internal route (for server-side notification creation)
router.post('/', createNotification);

module.exports = router;
