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
        <div style="display:flex;flex-direction:column;gap:20px;">
          <div>
            <h2 style="font-size:24px;font-weight:700;color:#1E293B;margin:0;">${item.title}</h2>
            <p style="font-size:13px;color:#64748B;margin:6px 0 0;font-weight:500;">Found on Campus</p>
          </div>
          
          <div style="width:100%;height:280px;background:#F1F5F9;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:60px;overflow:hidden;border:1.5px solid #E2E8F0;">
            ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />` : ''}
            ${item.image_url ? '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:60px;hidden;">📦</div>' : '<div style="font-size:60px;">📦</div>'}
          </div>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:16px;background:linear-gradient(to bottom,#F8FAFC,#fff);border-radius:12px;border:1px solid #E2E8F0;">
            <div>
              <p style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;letter-spacing:.4px;margin:0;">Category</p>
              <p style="font-size:14px;color:#1E293B;font-weight:600;margin:6px 0 0;">${getCategoryName(item.category)}</p>
            </div>
            <div>
              <p style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;letter-spacing:.4px;margin:0;">Date Found</p>
              <p style="font-size:14px;color:#1E293B;font-weight:600;margin:6px 0 0;">${formatDisplayDate(item.date_found)}</p>
            </div>
            <div>
              <p style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;letter-spacing:.4px;margin:0;">Campus</p>
              <p style="font-size:14px;color:#1E293B;font-weight:600;margin:6px 0 0;">${item.campus}</p>
            </div>
            <div>
              <p style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;letter-spacing:.4px;margin:0;">Location</p>
              <p style="font-size:14px;color:#1E293B;font-weight:600;margin:6px 0 0;">${item.location_found}</p>
            </div>
          </div>
          
          <div>
            <h3 style="font-size:12px;color:#64748B;font-weight:600;text-transform:uppercase;letter-spacing:.4px;margin:0;">Description</h3>
            <p style="font-size:14px;color:#475569;line-height:1.6;margin:8px 0 0;">${item.description}</p>
          </div>
          
          <div style="padding:12px 16px;background:linear-gradient(135deg,#F0F4FF,#F5EBFF);border-radius:10px;border:1px solid #E9D5FF;display:flex;align-items:center;gap:12px;">
            <span style="font-size:20px;">👤</span>
            <div>
              <p style="font-size:12px;color:#64748B;margin:0;">Posted by</p>
              <p style="font-size:13px;color:#1E293B;font-weight:600;margin:2px 0 0;">${item.first_name} ${item.last_name}</p>
            </div>
          </div>
          
          ${user && item.status === 'unclaimed' ? `
            <button type="button" id="makeClaimBtn" style="width:100%;padding:12px 16px;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;border:none;border-radius:10px;font-weight:600;font-size:14px;cursor:pointer;transition:all .2s;box-shadow:0 2px 8px rgba(79,70,229,.25);" onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 4px 12px rgba(79,70,229,.35)';" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(79,70,229,.25)';">
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
