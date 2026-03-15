/**
 * Image URL Utility
 * Handles conversion of image paths to full URLs for both development and production
 */

/**
 * Build absolute image URL based on the request origin
 * @param {string} imagePath - Relative image path (e.g., /uploads/filename.jpg)
 * @param {object} req - Express request object (optional, for getting origin in middleware)
 * @returns {string|null} - Full absolute URL or null if no image
 */
function buildImageUrl(imagePath, req = null) {
  if (!imagePath) {
    return null;
  }

  // If the image path is already an absolute URL (from external source), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Build the base URL
  let baseUrl;

  if (req) {
    // Use the request origin when available (middleware context)
    baseUrl = `${req.protocol}://${req.get('host')}`;
  } else {
    // Fallback to environment-based URL
    const apiUrl = process.env.API_URL || 'localhost:5000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    // Ensure API_URL doesn't include protocol
    const cleanUrl = apiUrl.replace(/^https?:\/\//, '');
    baseUrl = `${protocol}://${cleanUrl}`;
  }

  // Ensure imagePath starts with /
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  return `${baseUrl}${cleanPath}`;
}

/**
 * Transform item data to include absolute image URLs
 * @param {object|array} items - Single item or array of items
 * @param {object} req - Express request object (optional)
 * @returns {object|array} - Transformed item(s) with absolute image URLs
 */
function transformItemsImageUrls(items, req = null) {
  if (!items) {
    return items;
  }

  // Handle array of items
  if (Array.isArray(items)) {
    return items.map(item => ({
      ...item,
      image_url: buildImageUrl(item.image_url, req)
    }));
  }

  // Handle single item
  return {
    ...items,
    image_url: buildImageUrl(items.image_url, req)
  };
}

module.exports = {
  buildImageUrl,
  transformItemsImageUrls
};
