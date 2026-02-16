// Profile page functionality
document.addEventListener('DOMContentLoaded', async () => {
  redirectToLoginIfNeeded();

  const form = document.getElementById('profileForm');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');
  const newPasswordInput = document.getElementById('newPassword');
  const passwordRequirements = document.getElementById('passwordRequirements');

  // Load user data
  const user = getUser();

  try {
    const response = await apiCall('/auth/me', 'GET');
    
    if (response) {
      document.getElementById('studentId').value = response.student_id;
      document.getElementById('email').value = response.email;
      document.getElementById('firstName').value = response.first_name;
      document.getElementById('lastName').value = response.last_name;
      document.getElementById('campus').value = response.campus;
      document.getElementById('program').value = response.program || '';
    }
  } catch (error) {
    showError(errorMessage, 'Failed to load profile data: ' + error.message);
  }

  // Monitor password input for requirements
  if (newPasswordInput) {
    newPasswordInput.addEventListener('input', (e) => {
      if (e.target.value) {
        passwordRequirements.style.display = 'block';
        updatePasswordRequirements(e.target.value, passwordRequirements);
      } else {
        passwordRequirements.style.display = 'none';
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      hideMessage(errorMessage);
      hideMessage(successMessage);

      const formData = new FormData(form);
      const data = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        campus: formData.get('campus'),
        program: formData.get('program')
      };

      // Check if password change is being requested
      const currentPassword = formData.get('password');
      const newPassword = formData.get('newPassword');
      const confirmPassword = formData.get('confirmPassword');

      if (newPassword || currentPassword || confirmPassword) {
        if (!currentPassword || !newPassword || !confirmPassword) {
          showError(errorMessage, 'Please fill in all password fields or leave them all empty');
          return;
        }

        // Validate new password
        const passwordErrors = validatePassword(newPassword);
        if (passwordErrors.length > 0) {
          showError(errorMessage, passwordErrors);
          return;
        }

        if (newPassword !== confirmPassword) {
          showError(errorMessage, 'New passwords do not match');
          return;
        }

        data.password = currentPassword;
        data.newPassword = newPassword;
      }

      try {
        const response = await apiCall('/auth/profile', 'PUT', data);
        
        if (response && response.user) {
          setUser(response.user);
          showSuccess(successMessage, 'Profile updated successfully!');
          
          // Reset password fields
          document.getElementById('currentPassword').value = '';
          document.getElementById('newPassword').value = '';
          document.getElementById('confirmPassword').value = '';
          if (passwordRequirements) {
            passwordRequirements.style.display = 'none';
          }
        }
      } catch (error) {
        showError(errorMessage, error.message);
      }
    });
  }
});
