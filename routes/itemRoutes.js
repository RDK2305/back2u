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
  updateItemBysecurity
} = require('../controllers/itemController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getItemClaims } = require('../controllers/claimController');

// Public routes
router.get('/', getItems);
router.get('/public/found-items', getPublicFoundItems);

// Specific GET routes (must come before /:id)
router.get('/lost/my-items', protect, getUserLostItems);
router.get('/found/my-items', protect, getUserFoundItems);

// Private POST operations
router.post('/lost', protect, upload.single('image'), reportLostItem);
router.post('/found', protect, upload.single('image'), reportFoundItem);

// GET/:id routes with specific sub-routes
router.get('/:id/claims', protect, getItemClaims);
router.get('/:id', getItem);

// security operations
router.post('/security', protect, authorize('security'), upload.single('image'), createItemBysecurity);
router.put('/security/:id', protect, authorize('security'), upload.single('image'), updateItemBysecurity);

// Update and delete operations
router.put('/:id/status', protect, authorize('security'), updateItemStatus);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, authorize('security'), deleteItem);

module.exports = router;