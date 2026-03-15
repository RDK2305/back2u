const Claim = require('../models/Claim');
const Item = require('../models/Item');
const { sendNotification } = require('./notificationController');
const { transformItemsImageUrls } = require('../utils/imageUrlUtil');

// @desc    Create claim
// @route   POST /api/claims
// @access  Private
const createClaim = async (req, res) => {
  try {
    const { item_id } = req.body;
    
    // Check if item exists
    const item = await Item.findById(item_id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if item is already claimed
    if (item.status === 'Claimed') {
      return res.status(400).json({ message: 'Item is already claimed' });
    }
    
    // Create claim
    const claimData = {
      item_id,
      claimer_id: req.user.id,
      owner_id: item.user_id // Original reporter is potential owner
    };
    
    const claim = await Claim.create(claimData);
    
    // Send notification to item owner
    if (item.user_id) {
      await sendNotification(
        item.user_id,
        'claim_submission',
        'New Claim on Your Item',
        `Someone has claimed your item: "${item.title}". Please review their verification answers.`,
        item_id,
        claim.id
      );
    }
    
    // Transform image URL to absolute path
    const transformedClaim = {
      ...claim,
      item_image: claim.item_image ? transformItemsImageUrls({ image_url: claim.item_image }, req).image_url : null
    };
    
    res.status(201).json({
      message: 'Claim submitted successfully',
      claim: transformedClaim
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get claim by ID
// @route   GET /api/claims/:id
// @access  Private
const getClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    // Check if user is authorized to view this claim
    if (claim.claimer_id !== req.user.id && claim.owner_id !== req.user.id && req.user.role !== 'security') {
      return res.status(403).json({ message: 'Not authorized to view this claim' });
    }
    
    // Transform image URL to absolute path
    const transformedClaim = {
      ...claim,
      item_image: claim.item_image ? transformItemsImageUrls({ image_url: claim.item_image }, req).image_url : null
    };
    
    res.json(transformedClaim);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify claim (security only)
// @route   PUT /api/claims/:id/verify
// @access  Private/security
const verifyClaim = async (req, res) => {
  try {
    const { status, verification_notes } = req.body;
    
    if (!['verified', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const claim = await Claim.updateStatus(req.params.id, status, verification_notes);
    
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Get item details for notification
    const item = await Item.findById(claim.item_id);
    
    // Send notification to claimer based on status
    if (status === 'verified') {
      await sendNotification(
        claim.claimer_id,
        'claim_approved',
        'Claim Approved ✓',
        `Your claim for "${item?.title}" has been approved. Please coordinate with the item owner for pickup.`,
        claim.item_id,
        claim.id
      );
    } else if (status === 'rejected') {
      await sendNotification(
        claim.claimer_id,
        'claim_rejected',
        'Claim Not Approved',
        `Your claim for "${item?.title}" could not be verified. Please review the verification notes.`,
        claim.item_id,
        claim.id
      );
    }
    
    // Transform image URL to absolute path
    const transformedClaim = {
      ...claim,
      item_image: claim.item_image ? transformItemsImageUrls({ image_url: claim.item_image }, req).image_url : null
    };
    
    res.json({
      message: 'Claim verification updated successfully',
      claim: transformedClaim
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's claims
// @route   GET /api/claims/user/my-claims
// @access  Private
const getUserClaims = async (req, res) => {
  try {
    const claims = await Claim.getUserClaims(req.user.id);
    
    // Transform image URLs for all claims
    const transformedClaims = claims.map(claim => ({
      ...claim,
      item_image: claim.item_image ? transformItemsImageUrls({ image_url: claim.item_image }, req).image_url : null
    }));
    
    res.json({
      success: true,
      count: transformedClaims.length,
      data: transformedClaims
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get claims for an item
// @route   GET /api/items/:id/claims
// @access  Private
const getItemClaims = async (req, res) => {
  try {
    const claims = await Claim.findByItemId(req.params.id);
    
    // Transform image URLs for all claims
    const transformedClaims = claims.map(claim => ({
      ...claim,
      item_image: claim.item_image ? transformItemsImageUrls({ image_url: claim.item_image }, req).image_url : null
    }));
    
    res.json({
      success: true,
      count: transformedClaims.length,
      data: transformedClaims
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update claim
// @route   PUT /api/claims/:id
// @access  Private
const updateClaim = async (req, res) => {
  try {
    const { status, verification_notes } = req.body;
    
    const claim = await Claim.findById(req.params.id);
    
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    // Check authorization - claimer or security can update
    if (claim.claimer_id !== req.user.id && req.user.role !== 'security') {
      return res.status(403).json({ message: 'Not authorized to update this claim' });
    }
    
    // Validate status if provided
    if (status && !['pending', 'verified', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const updatedClaim = await Claim.update(req.params.id, {
      status: status || claim.status,
      verification_notes: verification_notes || claim.verification_notes
    });
    
    // Transform image URL to absolute path
    const transformedClaim = {
      ...updatedClaim,
      item_image: updatedClaim.item_image ? transformItemsImageUrls({ image_url: updatedClaim.item_image }, req).image_url : null
    };
    
    res.json({
      message: 'Claim updated successfully',
      claim: transformedClaim
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete/Cancel claim
// @route   DELETE /api/claims/:id
// @access  Private
const deleteClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    // Check authorization - claimer or security can delete
    if (claim.claimer_id !== req.user.id && req.user.role !== 'security') {
      return res.status(403).json({ message: 'Not authorized to delete this claim' });
    }
    
    // Only pending claims can be deleted
    if (claim.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending claims can be cancelled' });
    }
    
    const deleted = await Claim.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    res.json({ message: 'Claim deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createClaim,
  getClaim,
  verifyClaim,
  updateClaim,
  getUserClaims,
  getItemClaims,
  deleteClaim
};