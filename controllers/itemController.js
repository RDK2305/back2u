const Item = require('../models/Item');
const User = require('../models/User');
const path = require('path');

// @desc    Get all items
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
  try {
    const { category, campus, status, search, limit = 20, page = 1 } = req.query;
    
    const filters = {
      category,
      campus,
      status,
      search,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const items = await Item.findAll(filters);
    
    // Get total count for pagination
    const countFilters = { category, campus, status, search };
    const allItems = await Item.findAll(countFilters);
    
    res.json({
      success: true,
      count: items.length,
      total: allItems.length,
      page: parseInt(page),
      pages: Math.ceil(allItems.length / parseInt(limit)),
      data: items
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Report found item
// @route   POST /api/items/found
// @access  Private
const reportFoundItem = async (req, res) => {
  try {
    const { title, category, description, location_found, campus, distinguishing_features } = req.body;
    
    // Get image URL if file uploaded
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const itemData = {
      title,
      category,
      description,
      location_found,
      campus,
      type: 'found',
      status: 'Open',
      distinguishing_features,
      date_found: new Date().toISOString().split('T')[0],
      image_url,
      user_id: req.user.id
    };

    const item = await Item.create(itemData);
    
    res.status(201).json({
      message: 'Found item registered successfully',
      item
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Report lost item
// @route   POST /api/items/lost
// @access  Private
const reportLostItem = async (req, res) => {
  try {
    const { title, category, description, location_lost, campus, date_lost, distinguishing_features } = req.body;
    console.log({ title, category, description, location_lost, campus, date_lost, distinguishing_features });
    // Validate required fields
    if (!title || !category || !location_lost || !campus || !date_lost) {
      return res.status(400).json({ message: 'Missing required fields: title, category, location_lost, campus, date_lost' });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date_lost)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const itemData = {
      title,
      category,
      description,
      location_found: location_lost,
      campus,
      type: 'lost',
      status: 'Reported',
      date_lost,
      distinguishing_features,
      image_url: req.file ? `/uploads/${req.file.filename}` : null,
      user_id: req.user.id
    };

    const item = await Item.create(itemData);
    
    res.status(201).json({
      message: 'Lost item reported successfully',
      item
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update item details
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res) => {
  try {
    const { title, category, description, location_found, campus } = req.body;
    
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check authorization - user must be owner or security
    if (item.user_id !== req.user.id && req.user.role !== 'security') {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }
    
    const updatedItem = await Item.update(req.params.id, {
      title: title || item.title,
      category: category || item.category,
      description: description || item.description,
      location_found: location_found || item.location_found,
      campus: campus || item.campus
    });
    
    res.json({
      message: 'Item updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update item status
// @route   PUT /api/items/:id/status
// @access  Private
const updateItemStatus = async (req, res) => {
  try {
    const { status } = req.body;
    console.log('updateItemStatus called with id:', req.params.id, 'status:', status);

    const item = await Item.updateStatus(req.params.id, status);
    console.log('Item.updateStatus returned:', item);

    if (!item) {
      console.log('Item not found');
      return res.status(404).json({ message: 'Item not found' });
    }

    console.log('Item status updated successfully');
    res.json({
      message: 'Item status updated successfully',
      item
    });
  } catch (error) {
    console.error('Error in updateItemStatus:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res) => {
  try {
    const deleted = await Item.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's lost items
// @route   GET /api/items/lost/my-items
// @access  Private
const getUserLostItems = async (req, res) => {
  try {
    const items = await Item.findByUserId(req.user.id, 'lost');
    
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's found items
// @route   GET /api/items/found/my-items
// @access  Private
const getUserFoundItems = async (req, res) => {
  try {
    const items = await Item.findByUserId(req.user.id, 'found');
    
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all public found items
// @route   GET /api/items/public/found-items
// @access  Public
const getPublicFoundItems = async (req, res) => {
  try {
    const { category, campus, limit = 20, page = 1 } = req.query;

    const filters = {
      type: 'found',
      status: 'Open',
      category,
      campus,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const items = await Item.findAll(filters);

    // Get total count for pagination
    const allItems = await Item.findAll({ type: 'found', status: 'Open', category, campus });

    res.json({
      success: true,
      count: items.length,
      total: allItems.length,
      page: parseInt(page),
      pages: Math.ceil(allItems.length / parseInt(limit)),
      data: items
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create item by security
// @route   POST /api/items/security
// @access  Private/security
const createItemBysecurity = async (req, res) => {
  try {
    const { title, category, description, location_found, campus, type, status, distinguishing_features, date_lost, date_found, user_id } = req.body;

    // Validate required fields
    if (!title || !category || !location_found || !campus || !user_id) {
      return res.status(400).json({ message: 'Missing required fields: title, category, location_found, campus, user_id' });
    }

    // Validate user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate status
    const validStatuses = ['Reported', 'Open', 'Claimed', 'Returned', 'Disposed', 'Done', 'Pending', 'Verified'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Validate date format if provided
    if (date_lost && !/^\d{4}-\d{2}-\d{2}$/.test(date_lost)) {
      return res.status(400).json({ message: 'Invalid date_lost format. Use YYYY-MM-DD' });
    }
    if (date_found && !/^\d{4}-\d{2}-\d{2}$/.test(date_found)) {
      return res.status(400).json({ message: 'Invalid date_found format. Use YYYY-MM-DD' });
    }

    // Get image URL if file uploaded
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const itemData = {
      title,
      category,
      description,
      location_found,
      campus,
      type: type || 'found',
      status: status || 'Reported',
      distinguishing_features,
      date_lost,
      date_found,
      image_url,
      user_id
    };

    const item = await Item.create(itemData);

    res.status(201).json({
      message: 'Item created successfully by security',
      item
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update item by security
// @route   PUT /api/items/security/:id
// @access  Private/security
const updateItemBysecurity = async (req, res) => {
  try {
    const { title, category, description, location_found, campus, type, status, distinguishing_features, date_lost, date_found, user_id } = req.body;

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Validate user exists if user_id is being changed
    if (user_id) {
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    // Validate status
    const validStatuses = ['Reported', 'Open', 'Claimed', 'Returned', 'Disposed', 'Done', 'Pending', 'Verified'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Validate date format if provided
    if (date_lost && !/^\d{4}-\d{2}-\d{2}$/.test(date_lost)) {
      return res.status(400).json({ message: 'Invalid date_lost format. Use YYYY-MM-DD' });
    }
    if (date_found && !/^\d{4}-\d{2}-\d{2}$/.test(date_found)) {
      return res.status(400).json({ message: 'Invalid date_found format. Use YYYY-MM-DD' });
    }

    // Handle image upload
    let image_url = item.image_url;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    const updatedItem = await Item.update(req.params.id, {
      title: title || item.title,
      category: category || item.category,
      description: description || item.description,
      location_found: location_found || item.location_found,
      campus: campus || item.campus,
      type: type || item.type,
      status: status || item.status,
      distinguishing_features: distinguishing_features !== undefined ? distinguishing_features : item.distinguishing_features,
      date_lost: date_lost || item.date_lost,
      date_found: date_found || item.date_found,
      image_url,
      user_id: user_id || item.user_id
    });

    res.json({
      message: 'Item updated successfully by security',
      item: updatedItem
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
};
