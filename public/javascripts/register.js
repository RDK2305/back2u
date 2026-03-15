// Register page functionality with role-based registration
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const errorMessages = document.getElementById('errorMessages');
  const successMessage = document.getElementById('successMessage');
  const passwordInput = document.getElementById('password');
  const passwordRequirements = document.getElementById('passwordRequirements');
  const roleSelect = document.getElementById('roleSelect');
  const professorCodeField = document.getElementById('professorCodeField');
  const securityCodeField = document.getElementById('securityCodeField');

  // Handle role selection
  if (roleSelect) {
    roleSelect.addEventListener('change', (e) => {
      const selectedRole = e.target.value;
      
      // Hide all code fields first
      professorCodeField.classList.add('hidden');
      securityCodeField.classList.add('hidden');
      
      // Show appropriate field based on role
      if (selectedRole === 'professor') {
        professorCodeField.classList.remove('hidden');
        document.getElementById('professorCode').required = true;
        document.getElementById('securityCode').required = false;
      } else if (selectedRole === 'security') {
        securityCodeField.classList.remove('hidden');
        document.getElementById('securityCode').required = true;
        document.getElementById('professorCode').required = false;
      } else {
        document.getElementById('professorCode').required = false;
        document.getElementById('securityCode').required = false;
      }
    });
  }

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
      const role = formData.get('role');
      const email = formData.get('email');
      const firstName = formData.get('first_name');
      const lastName = formData.get('last_name');
      const campus = formData.get('campus');
      const program = formData.get('program');
      const password = formData.get('password');
      const confirmPassword = document.getElementById('confirmPassword').value;

      // Validate role selection
      if (!role) {
        showError(errorMessages, 'Please select your role');
        return;
      }

      // Validate email
      if (!validateEmail(email)) {
        showError(errorMessages, 'Please enter a valid email address');
        return;
      }

      // Validate email domain
      if (!email.endsWith('@conestogac.on.ca') && !email.endsWith('@conestoga.ca')) {
        showError(errorMessages, 'Please use your Conestoga email');
        return;
      }

      // Validate password
      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        showError(errorMessages, passwordErrors);
        return;
      }

      // Check password match
      if (password !== confirmPassword) {
        showError(errorMessages, 'Passwords do not match');
        return;
      }

      // Role-specific validation and registration
      try {
        let endpoint, data, responseHandler;

        if (role === 'student') {
          endpoint = '/auth/register';
          data = {
            email,
            first_name: firstName,
            last_name: lastName,
            campus,
            program,
            password
          };
          responseHandler = handleStudentRegistration;
        } 
        else if (role === 'professor') {
          const professorCode = formData.get('professorCode');
          if (!professorCode) {
            showError(errorMessages, 'Professor registration code is required');
            return;
          }
          endpoint = '/auth/register-professor';
          data = {
            email,
            first_name: firstName,
            last_name: lastName,
            program,
            password,
            professorCode
          };
          responseHandler = handleProfessorRegistration;
        } 
        else if (role === 'security') {
          const securityCode = formData.get('securityCode');
          if (!securityCode) {
            showError(errorMessages, 'Security registration code is required');
            return;
          }
          endpoint = '/auth/register-security';
          data = {
            email,
            first_name: firstName,
            last_name: lastName,
            program,
            password,
            securityCode
          };
          responseHandler = handleSecurityRegistration;
        }

        const response = await apiCall(endpoint, 'POST', data);
        responseHandler(response, successMessage, errorMessages, form);
      } catch (error) {
        showError(errorMessages, error.message);
      }
    });
  }

  function handleStudentRegistration(response, successMessage, errorMessages, form) {
    if (response && response.user) {
      // Student registration requires email verification
      showSuccess(successMessage, `✅ Account created! Your Student ID is: ${response.user.student_id}\n📧 Please verify your email before logging in.`);
      form.reset();
      
      setTimeout(() => {
        window.location.href = '/verify-email.html';
      }, 3000);
    } else {
      showError(errorMessages, 'Registration failed. Please try again.');
    }
  }

  function handleProfessorRegistration(response, successMessage, errorMessages, form) {
    if (response && response.token) {
      setToken(response.token);
      setUser(response.user);
      
      showSuccess(successMessage, `✅ Welcome, Professor ${response.user.first_name}! Your ID: ${response.user.student_id}\n🎓 Redirecting to dashboard...`);
      
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 2000);
    } else {
      showError(errorMessages, response?.message || 'Registration failed');
    }
  }

  function handleSecurityRegistration(response, successMessage, errorMessages, form) {
    if (response && response.token) {
      setToken(response.token);
      setUser(response.user);
      
      showSuccess(successMessage, `✅ Welcome, Security Staff ${response.user.first_name}! Your ID: ${response.user.student_id}\n🔒 Redirecting to dashboard...`);
      
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 2000);
    } else {
      showError(errorMessages, response?.message || 'Registration failed');
    }
  }
});
