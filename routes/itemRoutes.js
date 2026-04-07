const express = require('express');
const router = express.Router();
const {
  getItems,
  getItem,
  reportFoundItem,
  reportLostItem,
  updateItem,
  updateItemStatus,
  deleteItem,
  getUserLostItems,
  getUserFoundItems,
  getPublicFoundItems,
  createItemBysecurity,
  updateItemBysecurity,
  deactivateItem,
  activateItem,
  getMatchingItems
} = require('../controllers/itemController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getItemClaims } = require('../controllers/claimController');

// Public routes (optionalAuth so security dashboard can pass includeInactive)
router.get('/', optionalAuth, getItems);
router.get('/public/found-items', getPublicFoundItems);

// Specific GET routes (must come before /:id)
router.get('/lost/my-items', protect, getUserLostItems);
router.get('/found/my-items', protect, getUserFoundItems);

// Private POST operations
router.post('/lost', protect, upload.single('image'), reportLostItem);
router.post('/found', protect, upload.single('image'), reportFoundItem);

// Item matching — GET /api/items/:id/matches
router.get('/:id/matches', protect, getMatchingItems);

// Claims for an item
router.get('/:id/claims', protect, getItemClaims);

// Single item
router.get('/:id', getItem);

// Security moderation — deactivate / activate
router.patch('/:id/deactivate', protect, authorize('security'), deactivateItem);
router.patch('/:id/activate',   protect, authorize('security'), activateItem);

// Security CRUD
router.post('/security', protect, authorize('security'), upload.single('image'), createItemBysecurity);
router.put('/security/:id', protect, authorize('security'), upload.single('image'), updateItemBysecurity);

// Update and delete operations
router.put('/:id/status', protect, authorize('security'), updateItemStatus);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, authorize('security'), deleteItem);

module.exports = router;
