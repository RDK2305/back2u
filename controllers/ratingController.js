const Rating = require('../models/Rating');
const Claim  = require('../models/Claim');

// @desc    Submit a rating for a completed claim
// @route   POST /api/ratings
// @access  Private
const submitRating = async (req, res) => {
  try {
    const { claim_id, rated_user_id, rating, review } = req.body;
    const rater_id = req.user.id;

    // Validate rating value
    const ratingNum = parseInt(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    if (!claim_id || !rated_user_id) {
      return res.status(400).json({ message: 'claim_id and rated_user_id are required' });
    }

    // Prevent self-rating
    if (rater_id === parseInt(rated_user_id)) {
      return res.status(400).json({ message: 'You cannot rate yourself' });
    }

    // Verify claim exists and involves this user
    const claim = await Claim.findById(claim_id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    const isInvolved = claim.claimer_id === rater_id || claim.owner_id === rater_id;
    if (!isInvolved && req.user.role !== 'security') {
      return res.status(403).json({ message: 'You are not part of this claim' });
    }

    const newRating = await Rating.create({ claim_id, rater_id, rated_user_id: parseInt(rated_user_id), rating: ratingNum, review });

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: newRating
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all ratings for a user (their profile reputation)
// @route   GET /api/ratings/user/:userId
// @access  Public
const getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;
    const [ratings, stats] = await Promise.all([
      Rating.getReceivedByUser(userId),
      Rating.getAverageForUser(userId)
    ]);

    res.json({
      success: true,
      stats: {
        average: parseFloat(stats.average) || 0,
        total: parseInt(stats.total) || 0
      },
      data: ratings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all ratings for a claim
// @route   GET /api/ratings/claim/:claimId
// @access  Private
const getClaimRatings = async (req, res) => {
  try {
    const ratings = await Rating.findByClaimId(req.params.claimId);
    res.json({ success: true, count: ratings.length, data: ratings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get average rating for a user
// @route   GET /api/ratings/user/:userId/average
// @access  Public
const getUserAverage = async (req, res) => {
  try {
    const stats = await Rating.getAverageForUser(req.params.userId);
    res.json({
      success: true,
      average: parseFloat(stats.average) || 0,
      total: parseInt(stats.total) || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitRating, getUserRatings, getClaimRatings, getUserAverage };
