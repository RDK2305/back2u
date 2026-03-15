const Notification = require('../models/Notification');

// @desc    Create notification
// @route   POST /api/notifications
// @access  Private (Internal)
const createNotification = async (req, res) => {
  try {
    const { user_id, type, title, message, related_item_id, related_claim_id } = req.body;
    
    const notificationData = {
      user_id,
      type,
      title,
      message,
      related_item_id,
      related_claim_id
    };

    const notification = await Notification.create(notificationData);
    
    res.status(201).json({
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.getUserNotifications(
      req.user.id,
      parseInt(limit),
      offset
    );

    const unreadCount = await Notification.getUnreadCount(req.user.id);

    res.json({
      success: true,
      count: notifications.length,
      unread: unreadCount,
      page: parseInt(page),
      data: notifications
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread/count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.getUnreadCount(req.user.id);
    
    res.json({
      success: true,
      unread_count: unreadCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Verify user owns this notification
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedNotification = await Notification.markAsRead(req.params.id);

    res.json({
      message: 'Notification marked as read',
      notification: updatedNotification
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all/read
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user.id);

    res.json({
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Verify user owns this notification
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Notification.deleteNotification(req.params.id);

    res.json({
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get notifications by type
// @route   GET /api/notifications/type/:type
// @access  Private
const getNotificationsByType = async (req, res) => {
  try {
    const notifications = await Notification.getNotificationsByType(
      req.user.id,
      req.params.type
    );

    res.json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to send notification (used internally)
const sendNotification = async (user_id, type, title, message, related_item_id = null, related_claim_id = null) => {
  try {
    const notificationData = {
      user_id,
      type,
      title,
      message,
      related_item_id,
      related_claim_id
    };

    return await Notification.create(notificationData);
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationsByType,
  sendNotification
};
