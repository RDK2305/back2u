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
          // Validate file size (max 5MB)
          if (fileInput.files[0].size > 5 * 1024 * 1024) {
            showError(errorMessage, 'File size must be less than 5MB');
            return;
          }
          
          // Validate file type
          const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
          if (!validTypes.includes(fileInput.files[0].type)) {
            showError(errorMessage, 'File must be JPG, PNG, or GIF');
            return;
          }
          
          uploadFormData.append('image', fileInput.files[0]);
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
