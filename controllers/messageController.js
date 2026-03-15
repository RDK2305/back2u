const Message = require('../models/Message');
const Claim = require('../models/Claim');

// @desc    Send message on claim
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { claim_id, receiver_id, message } = req.body;

    // Validate claim exists
    const claim = await Claim.findById(claim_id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Verify user is part of this claim
    if (claim.claimer_id !== req.user.id && claim.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to message on this claim' });
    }

    const messageData = {
      claim_id,
      sender_id: req.user.id,
      receiver_id,
      message
    };

    const newMessage = await Message.create(messageData);

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get claim messages
// @route   GET /api/messages/claim/:claimId
// @access  Private
const getClaimMessages = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId);

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Verify user is part of this claim
    if (claim.claimer_id !== req.user.id && claim.owner_id !== req.user.id && req.user.role !== 'security') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.getClaimMessages(req.params.claimId);

    // Mark messages as read
    await Message.markClaimMessagesAsRead(req.params.claimId, req.user.id);

    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's messages
// @route   GET /api/messages/inbox
// @access  Private
const getUserMessages = async (req, res) => {
  try {
    const messages = await Message.getUserMessages(req.user.id);

    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Message.getUnreadCount(req.user.id);

    res.json({
      success: true,
      unread_count: unreadCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
const markMessageAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Verify user is receiver
    if (message.receiver_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedMessage = await Message.markAsRead(req.params.id);

    res.json({
      message: 'Message marked as read',
      data: updatedMessage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Verify user is sender or receiver
    if (message.sender_id !== req.user.id && message.receiver_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Message.deleteMessage(req.params.id);

    res.json({
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  getClaimMessages,
  getUserMessages,
  getUnreadCount,
  markMessageAsRead,
  deleteMessage
};
