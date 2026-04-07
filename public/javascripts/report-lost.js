// Report Lost Item page functionality
document.addEventListener('DOMContentLoaded', () => {
  redirectToLoginIfNeeded();

  const form = document.getElementById('reportLostForm');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      hideMessage(errorMessage);
      hideMessage(successMessage);

      // Get form data
      const formData = new FormData(form);
      const fileInput = document.getElementById('image');
      
      // Validate required fields
      if (!formData.get('title') || !formData.get('category') || !formData.get('date_lost') || !formData.get('location_lost') || !formData.get('campus')) {
        showError(errorMessage, 'Please fill in all required fields (marked with *)');
        return;
      }

      // Validate date format
      const dateLost = formData.get('date_lost');
      if (!dateLost) {
        showError(errorMessage, 'Please select a date');
        return;
      }

      try {
        // Create FormData for file upload
        const uploadFormData = new FormData();
        uploadFormData.append('title', formData.get('title'));
        uploadFormData.append('category', formData.get('category'));
        uploadFormData.append('description', formData.get('description'));
        uploadFormData.append('location_lost', formData.get('location_lost'));
        uploadFormData.append('campus', formData.get('campus'));
        uploadFormData.append('date_lost', dateLost);
        uploadFormData.append('distinguishing_features', formData.get('distinguishing_features'));
        
        if (fileInput.files && fileInput.files[0]) {
          const file = fileInput.files[0];

          // Validate file type
          const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
          if (!validTypes.includes(file.type)) {
            showError(errorMessage, 'File must be JPG, PNG, GIF, or WEBP');
            return;
          }

          // Validate raw file size (max 10MB before compression)
          if (file.size > 10 * 1024 * 1024) {
            showError(errorMessage, 'File size must be less than 10MB');
            return;
          }

          // Compress image client-side to max 1024×1024 px and ~500KB
          const compressedBlob = await compressImage(file, 1024, 0.8);
          uploadFormData.append('image', compressedBlob, file.name);
        }

        const response = await apiCallFormData('/items/lost', 'POST', uploadFormData);
        
        if (response) {
          showSuccess(successMessage, 'Lost item reported successfully! Redirecting to dashboard...');
          
          setTimeout(() => {
            window.location.href = '/dashboard.html';
          }, 2000);
        }
      } catch (error) {
        showError(errorMessage, error.message);
      }
    });
  }

  // Set today's date as default
  const dateLostInput = document.getElementById('dateLost');
  if (dateLostInput) {
    const today = new Date();
    dateLostInput.value = formatDate(today);
  }
});

/**
 * Compress an image file using Canvas API
 * @param {File} file - Original image file
 * @param {number} maxDim - Maximum width or height in pixels (default 1024)
 * @param {number} quality - JPEG quality 0-1 (default 0.8)
 * @returns {Promise<Blob>} - Compressed image blob
 */
function compressImage(file, maxDim = 1024, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if larger than maxDim
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width  = maxDim;
        } else {
          width  = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Image compression failed'));
          console.log(`🗜️ Image compressed: ${(file.size / 1024).toFixed(0)}KB → ${(blob.size / 1024).toFixed(0)}KB`);
          resolve(blob);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = url;
  });
}
