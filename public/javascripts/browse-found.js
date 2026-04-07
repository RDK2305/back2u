// Browse Found Items page functionality
let currentPage = 1;
let currentFilters = {};
let userLostItems = []; // Cache user's lost items for match detection

document.addEventListener('DOMContentLoaded', () => {
  redirectToLoginIfNeeded();
  
  const searchBtn = document.getElementById('searchBtn');
  const resetBtn = document.getElementById('resetBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const closeModal = document.getElementById('closeModal');
  const itemModal = document.getElementById('itemModal');
  const logoutBtn = document.getElementById('logoutBtn');

  if (searchBtn) searchBtn.addEventListener('click', search);
  if (resetBtn) resetBtn.addEventListener('click', resetFilters);
  if (prevBtn) prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
  
  // Modal close functionality
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      itemModal.style.display = 'none';
    });
  }
  
  // Close modal when clicking outside
  if (itemModal) {
    itemModal.addEventListener('click', (e) => {
      if (e.target === itemModal) {
        itemModal.style.display = 'none';
      }
    });
  }
  
  // Logout functionality
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      removeToken();
      removeUser();
      window.location.href = 'index.html';
    });
  }

  // Delegate click to open modal from cards
  const itemsContainer = document.getElementById('itemsContainer');
  if (itemsContainer) {
    itemsContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.item-card');
      if (!card) return;
      const id = Number(card.dataset.id);
      if (!Number.isNaN(id)) viewItemDetails(id);
    });
  }

  // Load user's lost items for match detection, then load found items
  loadUserLostItems().then(() => loadItems());
});

// Fetch current user's open lost items for match detection
async function loadUserLostItems() {
  try {
    const user = getUser();
    if (!user) return;
    const response = await apiCall('/items/lost/my-items', 'GET');
    if (response && response.data) {
      userLostItems = response.data.filter(i => i.status === 'Reported');
    }
  } catch (e) {
    // Non-critical — silently ignore if fails
  }
}

async function loadItems() {
  const container = document.getElementById('itemsContainer');
  const paginationContainer = document.getElementById('paginationContainer');
  const emptyState = document.getElementById('emptyState');
  const errorMessage = document.getElementById('errorMessage');

  try {
    hideMessage(errorMessage);
    container.innerHTML = '<p>Loading items...</p>';

    const filters = {
      ...currentFilters,
      limit: 12,
      page: currentPage
    };

    const query = new URLSearchParams();
    query.append('type', 'found');
    
    if (filters.category) query.append('category', filters.category);
    if (filters.campus) query.append('campus', filters.campus);
    if (filters.search) query.append('search', filters.search);
    query.append('limit', filters.limit);
    query.append('page', filters.page);

    const response = await apiCall(`/items?${query.toString()}`, 'GET');

    if (response && response.data) {
      const items = response.data;

      if (items.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        paginationContainer.style.display = 'none';
      } else {
        emptyState.style.display = 'none';
        container.style.display = 'grid';

        container.innerHTML = items.map(item => {
          const match = getMatchStrength(item);
          const matchBadge = match === 'high'
            ? `<div class="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">🎯 High Match</div>`
            : match === 'medium'
            ? `<div class="absolute top-2 left-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow">⚡ Possible Match</div>`
            : '';
          const borderClass = match === 'high' ? 'ring-2 ring-green-400' : match === 'medium' ? 'ring-2 ring-yellow-300' : '';
          return `
          <div class="relative bg-white rounded-lg overflow-hidden shadow-md transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer item-card ${borderClass}" data-id="${item.id}">
            ${matchBadge}
            <div class="w-full h-52 bg-gray-100 flex items-center justify-center text-5xl ${!item.image_url ? 'bg-gradient-to-br from-gray-100 to-gray-200' : ''}">
              ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}" class="w-full h-full object-cover">` : '📦'}
            </div>
            <div class="p-6">
              <span class="inline-block bg-gray-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium mb-2">${getCategoryName(item.category)}</span>
              <h3 class="text-lg font-semibold text-gray-800">${item.title}</h3>
              <div class="text-sm text-gray-600 my-2">
                <p><strong>Campus:</strong> ${item.campus}</p>
                <p><strong>Location:</strong> ${item.location_found}</p>
                <p><strong>Date Found:</strong> ${formatDisplayDate(item.date_found)}</p>
                <p><strong>Posted by:</strong> ${item.first_name} ${item.last_name}</p>
              </div>
              <span class="inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusClass(item.status)}">${item.status}</span>
            </div>
          </div>`;
        }).join('');

        // Update pagination
        if (response.pages > 1) {
          document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${response.pages}`;
          document.getElementById('prevBtn').disabled = currentPage === 1;
          document.getElementById('nextBtn').disabled = currentPage === response.pages;
          paginationContainer.style.display = 'flex';
        } else {
          paginationContainer.style.display = 'none';
        }
      }
    }
  } catch (error) {
    container.style.display = 'none';
    container.innerHTML = '';
    showError(errorMessage, error.message);
  }
}

function search() {
  const keyword = document.getElementById('searchKeyword').value;
  const category = document.getElementById('filterCategory').value;
  const campus = document.getElementById('filterCampus').value;

  currentFilters = {
    search: keyword,
    category,
    campus
  };

  currentPage = 1;
  loadItems();
}

function resetFilters() {
  document.getElementById('searchKeyword').value = '';
  document.getElementById('filterCategory').value = '';
  document.getElementById('filterCampus').value = '';

  currentFilters = {};
  currentPage = 1;
  loadItems();
}

function goToPage(page) {
  currentPage = page;
  loadItems();
}

async function viewItemDetails(itemId) {
  const errorMessage = document.getElementById('errorMessage');
  
  try {
    const response = await apiCall(`/items/${itemId}`, 'GET');
    
    if (response) {
      const item = response;
      const modalBody = document.getElementById('modalBody');
      const user = getUser();
      
      modalBody.innerHTML = `
        <div class="space-y-6">
          <h2 class="text-3xl font-bold text-gray-800">${item.title}</h2>
          
          <div class="w-full h-72 bg-gray-100 rounded-lg flex items-center justify-center text-6xl overflow-hidden">
            ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />` : ''}
            ${item.image_url ? '<div class="w-full h-full flex items-center justify-center text-6xl hidden">📦</div>' : '📦'}
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-600"><strong>Category:</strong> ${getCategoryName(item.category)}</p>
              <p class="text-sm text-gray-600 mt-2"><strong>Campus:</strong> ${item.campus}</p>
              <p class="text-sm text-gray-600 mt-2"><strong>Location Found:</strong> ${item.location_found}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600"><strong>Date Found:</strong> ${formatDisplayDate(item.date_found)}</p>
              <p class="text-sm text-gray-600 mt-2"><strong>Status:</strong> <span class="inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(item.status)}">${item.status}</span></p>
              <p class="text-sm text-gray-600 mt-2"><strong>Posted by:</strong> ${item.first_name} ${item.last_name}</p>
            </div>
          </div>
          
          <div>
            <p class="text-sm text-gray-600"><strong>Description:</strong></p>
            <p class="text-gray-700 mt-2">${item.description}</p>
          </div>
          
          ${user && item.status === 'unclaimed' ? `
            <button type="button" id="makeClaimBtn" class="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all">
              📋 Make a Claim
            </button>
          ` : ''}
        </div>
      `;
      
      // Show modal
      const itemModal = document.getElementById('itemModal');
      itemModal.style.display = 'flex';

      // Bind claim button without inline handler
      const makeClaimBtn = document.getElementById('makeClaimBtn');
      if (makeClaimBtn) {
        makeClaimBtn.addEventListener('click', () => makeClaimForItem(item.id));
      }
    }
  } catch (error) {
    showError(errorMessage, 'Failed to load item details: ' + error.message);
  }
}

function makeClaimForItem(itemId) {
  // Close modal first
  document.getElementById('itemModal').style.display = 'none';

  // Navigate to claim page with item ID
  window.location.href = `my-claims.html?itemId=${itemId}`;
}

/**
 * Compare a found item against user's lost items.
 * Returns 'high' (same category + campus), 'medium' (same category), or null.
 */
function getMatchStrength(foundItem) {
  if (!userLostItems || userLostItems.length === 0) return null;
  for (const lost of userLostItems) {
    if (lost.category === foundItem.category && lost.campus === foundItem.campus) return 'high';
  }
  for (const lost of userLostItems) {
    if (lost.category === foundItem.category) return 'medium';
  }
  return null;
}
