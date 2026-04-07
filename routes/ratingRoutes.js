const express = require('express');
const router = express.Router();
const { submitRating, getUserRatings, getClaimRatings, getUserAverage } = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');

// Public
router.get('/user/:userId',         getUserRatings);
router.get('/user/:userId/average', getUserAverage);

// Private
router.get('/claim/:claimId', protect, getClaimRatings);
router.post('/',              protect, submitRating);

module.exports = router;
