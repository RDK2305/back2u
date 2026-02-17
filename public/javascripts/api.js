// API Configuration
const API_BASE_URL = 'https://back2u-h67h.onrender.com//api';

// Helper function to get JWT token from localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Helper function to set JWT token in localStorage
function setToken(token) {
  localStorage.setItem('token', token);
}

// Helper function to remove JWT token
function removeToken() {
  localStorage.removeItem('token');
}

// Helper function to get user from localStorage
function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Helper function to set user in localStorage
function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

// Helper function to remove user
function removeUser() {
  localStorage.removeItem('user');
}

// Check if user is authenticated
function isAuthenticated() {
  return !!getToken();
}

// Redirect to login if not authenticated
function redirectToLoginIfNeeded() {
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
  }
}

// API call helper
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const token = getToken();
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (response.status === 401) {
      // Unauthorized - token expired or invalid
      removeToken();
      removeUser();
      window.location.href = '/login.html';
      return null;
    }

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'API call failed');
    }

    return responseData;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// API call helper for FormData (file uploads)
async function apiCallFormData(endpoint, method = 'POST', formData) {
  const options = {
    method,
    headers: {}
  };

  const token = getToken();
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  options.body = formData;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (response.status === 401) {
      removeToken();
      removeUser();
      window.location.href = '/login.html';
      return null;
    }

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'API call failed');
    }

    return responseData;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Update navbar based on authentication status
function updateNavbar() {
  const navAuth = document.getElementById('navAuth');
  if (!navAuth) return;

  if (isAuthenticated()) {
    const user = getUser();
    navAuth.textContent = 'Logout';
    navAuth.href = 'javascript:void(0)';
    navAuth.onclick = logout;
  } else {
    navAuth.textContent = 'Login';
    navAuth.href = '/login.html';
  }
}

// Logout function
function logout() {
  removeToken();
  removeUser();
  window.location.href = '/index.html';
}

// Add logout button functionality
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = logout;
  }

  // Also update navbar on auth pages
  updateNavbar();
});

// Validate email format
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
function validatePassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }
  
  return errors;
}

// Update password requirements display
function updatePasswordRequirements(password, requirementsContainer) {
  if (!requirementsContainer) return;

  const events = {
    'req-length': password.length >= 8,
    'req-number': /\d/.test(password),
    'req-special': /[!@#$%^&*]/.test(password)
  };

  for (const [id, valid] of Object.entries(events)) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = valid ? '✓' : '✗';
      element.style.color = valid ? '#51cf66' : '#999';
    }
  }
}

// Format date as YYYY-MM-DD
function formatDate(date) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

// Format date for display
function formatDisplayDate(date) {
  const d = new Date(date);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

// Display error message
function showError(container, message) {
  if (!container) return;
  
  if (Array.isArray(message)) {
    container.innerHTML = '<ul>' + message.map(m => `<li>${m}</li>`).join('') + '</ul>';
  } else {
    container.textContent = message;
  }
  container.style.display = 'block';
}

// Display success message
function showSuccess(container, message) {
  if (!container) return;
  
  container.textContent = message;
  container.style.display = 'block';
}

// Hide message
function hideMessage(container) {
  if (!container) return;
  container.style.display = 'none';
  container.textContent = '';
}

// Get category name from value
function getCategoryName(category) {
  const categories = {
    'phone': 'Phone',
    'wallet': 'Wallet',
    'keys': 'Keys',
    'id': 'Student/security ID',
    'clothing': 'Clothing',
    'bag': 'Bag',
    'textbook': 'Textbook',
    'electronics': 'Electronics',
    'other': 'Other'
  };
  return categories[category] || category;
}

// Get status badge class
function getStatusClass(status) {
  const statusMap = {
    'Reported': 'bg-yellow-100 text-yellow-800',
    'Open': 'bg-blue-100 text-blue-800',
    'Claimed': 'bg-green-100 text-green-800',
    'Returned': 'bg-green-100 text-green-800',
    'Disposed': 'bg-red-100 text-red-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'verified': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'completed': 'bg-green-100 text-green-800'
  };
  return statusMap[status] || 'bg-blue-100 text-blue-800';
}
