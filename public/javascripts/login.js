// Login page functionality
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      hideMessage(errorMessage);

      // Get form data
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      if (!email || !password) {
        showError(errorMessage, 'Please enter both email and password');
        return;
      }

      try {
        const response = await apiCall('/auth/login', 'POST', {
          email,
          password
        });
        
        if (response && response.token) {
          setToken(response.token);
          setUser(response.user);
          console.log(response);
          
          // Redirect to dashboard
          window.location.href = '/dashboard.html';
        }
      } catch (error) {
        showError(errorMessage, error.message);
      }
    });
  }
});
