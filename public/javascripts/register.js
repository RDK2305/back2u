// Register page functionality
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const errorMessages = document.getElementById('errorMessages');
  const successMessage = document.getElementById('successMessage');
  const passwordInput = document.getElementById('password');
  const passwordRequirements = document.getElementById('passwordRequirements');

  // Monitor password input for requirements
  if (passwordInput) {
    passwordInput.addEventListener('input', (e) => {
      updatePasswordRequirements(e.target.value, passwordRequirements);
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      hideMessage(errorMessages);
      hideMessage(successMessage);

      // Get form data
      const formData = new FormData(form);
      const data = {
        student_id: formData.get('student_id'),
        email: formData.get('email'),
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        campus: formData.get('campus'),
        program: formData.get('program'),
        password: formData.get('password'),
        role: 'student' // Default role since role selection was removed
      };

      // Validate email
      if (!validateEmail(data.email)) {
        showError(errorMessages, 'Please enter a valid email address');
        return;
      }

      // Validate email domain
      if (!data.email.endsWith('@conestogac.on.ca')) {
        showError(errorMessages, 'Please use your Conestoga email (@conestogac.on.ca)');
        return;
      }

      // Validate password
      const passwordErrors = validatePassword(data.password);
      if (passwordErrors.length > 0) {
        showError(errorMessages, passwordErrors);
        return;
      }

      // Check password match
      const confirmPassword = document.getElementById('confirmPassword').value;
      if (data.password !== confirmPassword) {
        showError(errorMessages, 'Passwords do not match');
        return;
      }

      try {
        const response = await apiCall('/auth/register', 'POST', data);
        
        if (response && response.token) {
          setToken(response.token);
          setUser(response.user);
          
          showSuccess(successMessage, 'Registration successful! Redirecting to dashboard...');
          
          setTimeout(() => {
            window.location.href = '/dashboard.html';
          }, 1500);
        }
      } catch (error) {
        showError(errorMessages, error.message);
      }
    });
  }
});
