// security Dashboard functionality
let currentPage = 1;
let currentFilters = {};

document.addEventListener('DOMContentLoaded', async () => {
  redirectToLoginIfNeeded();

  const user = getUser();

  // Check if user is security - redirect if not
  if (!user || user.role !== 'security') {
    window.location.href = '/';
    return;
  }

  // Update user info in sidebar
  if (user) {
    document.getElementById('userName').textContent = `${user.first_name} ${user.last_name}`;
    document.getElementById('userEmail').textContent = user.email;
  }

  // Setup form handlers
  setupFormHandlers();

  // Setup event delegation for item actions
  setupItemActions();

  // Load initial items
  loadItems();
});

function setupFormHandlers() {
  // Create item form
  const createForm = document.getElementById('createItemForm');
  if (createForm) {
    createForm.addEventListener('submit', handleCreateItem);
  }

  // Open create item modal button
  const openCreateBtn = document.getElementById('openCreateItemBtn');
  if (openCreateBtn) {
    openCreateBtn.addEventListener('click', openCreateItemModal);
  }

  // Apply filters button
  const applyFiltersBtn = document.getElementById('applyFiltersBtn');
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', applyFilters);
  }
}

function setupItemActions() {
  // Event delegation for item actions
  const itemsContainer = document.getElementById('itemsContainer');
  if (itemsContainer) {
    itemsContainer.addEventListener('click', (e) => {
      const viewBtn = e.target.closest('.action-view');
      const editBtn = e.target.closest('.action-edit');
      const deleteBtn = e.target.closest('.action-delete');

      if (viewBtn) {
        const id = Number(viewBtn.dataset.id);
        if (!Number.isNaN(id)) viewItem(id);
        return;
      }
      if (editBtn) {
        const id = Number(editBtn.dataset.id);
        if (!Number.isNaN(id)) editItem(id);
        return;
      }
      if (deleteBtn) {
        const id = Number(deleteBtn.dataset.id);
        if (!Number.isNaN(id)) deleteItem(id);
        return;
      }
    });
  }

  // Modal close buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-close-btn')) {
      const modalId = e.target.closest('[id]').id;
      if (modalId === 'createItemModal') {
        closeCreateItemModal();
      } else if (modalId === 'itemModal') {
        closeItemModal();
      } else if (modalId === 'editItemModal') {
        closeEditModal();
      }
    }
  });

  // Modal backdrop click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('fixed') && e.target.classList.contains('inset-0')) {
      const modalId = e.target.id;
      if (modalId === 'createItemModal') {
        closeCreateItemModal();
      } else if (modalId === 'itemModal') {
        closeItemModal();
      } else if (modalId === 'editItemModal') {
        closeEditModal();
      }
    }
  });

  // Modal action buttons
  document.addEventListener('click', (e) => {
    const updateBtn = e.target.closest('#updateStatusBtn');
    const editBtn = e.target.closest('#editItemBtn');
    const deleteBtn = e.target.closest('#deleteItemBtn');

    if (updateBtn) {
      const itemId = Number(updateBtn.dataset.itemId);
      if (!Number.isNaN(itemId)) updateItemStatus(itemId);
      return;
    }
    if (editBtn) {
      const itemId = Number(editBtn.dataset.itemId);
      if (!Number.isNaN(itemId)) editItem(itemId);
      return;
    }
    if (deleteBtn) {
      const itemId = Number(deleteBtn.dataset.itemId);
      if (!Number.isNaN(itemId)) deleteItem(itemId);
      return;
    }
  });
}

async function loadItems() {
  const container = document.getElementById('itemsContainer');
  const paginationContainer = document.getElementById('paginationContainer');
  const errorMessage = document.getElementById('errorMessage');

  try {
    hideMessage(errorMessage);
    container.innerHTML = '<div class="text-center py-12"><div class="text-4xl mb-3">⏳</div><p class="text-gray-500 font-medium">Loading items...</p></div>';

    const filters = {
      ...currentFilters,
      limit: 20,
      page: currentPage
    };

    const query = new URLSearchParams();

    if (filters.type) query.append('type', filters.type);
    if (filters.status) query.append('status', filters.status);
    if (filters.category) query.append('category', filters.category);
    if (filters.campus) query.append('campus', filters.campus);
    query.append('limit', filters.limit);
    query.append('page', filters.page);

    const response = await apiCall(`/items?${query.toString()}`, 'GET');

    if (response && response.data) {
      const items = response.data;

      if (items.length === 0) {
        container.innerHTML = '<div class="text-center p-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl"><div class="text-5xl mb-3">📭</div><h2 class="text-gray-600 mb-2 text-2xl font-bold">No items found</h2><p class="text-gray-500">Try adjusting your filters</p></div>';
        document.getElementById('statsContainer').style.display = 'none';
        paginationContainer.style.display = 'none';
      } else {
        // Update stats
        const stats = {
          total: response.total || items.length,
          open: items.filter(i => ['Open', 'Reported'].includes(i.status)).length,
          claimed: items.filter(i => i.status === 'Claimed').length,
          resolved: items.filter(i => ['Returned', 'Disposed', 'Done', 'Verified'].includes(i.status)).length
        };

        document.getElementById('statsTotal').textContent = stats.total;
        document.getElementById('statsOpen').textContent = stats.open;
        document.getElementById('statsClaimed').textContent = stats.claimed;
        document.getElementById('statsResolved').textContent = stats.resolved;
        document.getElementById('statsContainer').style.display = 'grid';

        // Render items
        container.innerHTML = items.map(item => `
          <div class="bg-white rounded-lg p-6 mb-4 shadow-md flex gap-6 items-start">
            <div class="w-40 h-32 bg-gray-100 rounded flex items-center justify-center text-3xl flex-shrink-0">
              ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}" class="w-full h-full object-cover rounded">` : '📦'}
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">${item.title}</h3>
              <div class="flex gap-8 flex-wrap my-3">
                <div class="text-sm text-gray-600">
                  <strong>Type:</strong> ${item.type}
                </div>
                <div class="text-sm text-gray-600">
                  <strong>Category:</strong> ${getCategoryName(item.category)}
                </div>
                <div class="text-sm text-gray-600">
                  <strong>Status:</strong> <span class="inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStatusClass(item.status)}">${item.status}</span>
                </div>
                <div class="text-sm text-gray-600">
                  <strong>Campus:</strong> ${item.campus}
                </div>
                <div class="text-sm text-gray-600">
                  <strong>Owner:</strong> ${item.first_name} ${item.last_name}
                </div>
              </div>
              ${item.description ? `<p class="text-sm"><strong>Description:</strong> ${item.description}</p>` : ''}
              <div class="flex gap-2 flex-wrap mt-4">
                <button class="px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700 rounded font-medium cursor-pointer action-view" data-id="${item.id}">View Details</button>
                <button class="px-4 py-2 bg-green-600 text-white text-sm hover:bg-green-700 rounded font-medium cursor-pointer action-edit" data-id="${item.id}">Edit</button>
                <button class="px-4 py-2 bg-red-600 text-white text-sm hover:bg-red-700 rounded font-medium cursor-pointer action-delete" data-id="${item.id}">Delete</button>
              </div>
            </div>
          </div>
        `).join('');

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
    container.innerHTML = '';
    showError(errorMessage, error.message);
  }
}

function applyFilters() {
  const type = document.getElementById('filterType').value;
  const status = document.getElementById('filterStatus').value;
  const category = document.getElementById('filterCategory').value;
  const campus = document.getElementById('filterCampus').value;

  currentFilters = {
    type: type || undefined,
    status: status || undefined,
    category: category || undefined,
    campus: campus || undefined
  };

  currentPage = 1;
  loadItems();
}

function goToPage(page) {
  currentPage = page;
  loadItems();
}

function openCreateItemModal() {
  // Use requestAnimationFrame to defer execution and avoid blocking
  requestAnimationFrame(() => {
    if (window.Modal) {
      Modal.show('createItemModal');
    } else {
      const modal = document.getElementById('createItemModal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
      }
    }
  });
}

function closeCreateItemModal() {
  if (window.Modal) {
    Modal.hide('createItemModal');
  } else {
    document.getElementById('createItemModal').style.display = 'none';
  }
  document.getElementById('createItemForm').reset();
}

async function handleCreateItem(event) {
  event.preventDefault();

  const formData = new FormData();
  formData.append('title', document.getElementById('itemTitle').value);
  formData.append('category', document.getElementById('itemCategory').value);
  formData.append('type', document.getElementById('itemType').value);
  formData.append('campus', document.getElementById('itemCampus').value);
  formData.append('location_found', document.getElementById('itemLocation').value);
  formData.append('user_id', document.getElementById('itemUserId').value);

  const status = document.getElementById('itemStatus').value;
  if (status) formData.append('status', status);

  const date = document.getElementById('itemDate').value;
  if (date) {
    const dateField = document.getElementById('itemType').value === 'lost' ? 'date_lost' : 'date_found';
    formData.append(dateField, date);
  }

  const description = document.getElementById('itemDescription').value;
  if (description) formData.append('description', description);

  const features = document.getElementById('itemFeatures').value;
  if (features) formData.append('distinguishing_features', features);

  const image = document.getElementById('itemImage').files[0];
  if (image) formData.append('image', image);

  try {
    const response = await apiCallFormData('/items/security', 'POST', formData);

    if (response) {
      alert('Item created successfully!');
      closeCreateItemModal();
      loadItems();
    }
  } catch (error) {
    alert('Failed to create item: ' + error.message);
  }
}

async function viewItem(itemId) {
  console.log('viewItem called with itemId:', itemId);
  const errorMessage = document.getElementById('errorMessage');

  try {
    console.log('Making API call to:', `/items/${itemId}`);
    const response = await apiCall(`/items/${itemId}`, 'GET');
    console.log('API response received:', response);
    console.log('Response type:', typeof response);
    console.log('Response keys:', response ? Object.keys(response) : 'null/undefined');

    if (response) {
      const item = response;
      console.log('Item data received:', item);

      const contentInner = `
            <div class="space-y-6">
              <h2 class="text-3xl font-bold text-gray-800">${item.title}</h2>

              <!-- Item Image -->
              <div class="w-full h-72 bg-gray-100 rounded-lg flex items-center justify-center text-6xl overflow-hidden">
                ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />` : ''}
                ${item.image_url ? '<div class="w-full h-full flex items-center justify-center text-6xl hidden">📦</div>' : '📦'}
              </div>

              <!-- Item Details -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-600"><strong>Type:</strong> ${item.type}</p>
                  <p class="text-sm text-gray-600 mt-2"><strong>Category:</strong> ${getCategoryName(item.category)}</p>
                  <p class="text-sm text-gray-600 mt-2"><strong>Campus:</strong> ${item.campus}</p>
                  <p class="text-sm text-gray-600 mt-2"><strong>Location:</strong> ${item.location_found}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600"><strong>Status:</strong> <span class="inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(item.status)}">${item.status}</span></p>
                  <p class="text-sm text-gray-600 mt-2"><strong>Date ${item.type === 'lost' ? 'Lost' : 'Found'}:</strong> ${formatDisplayDate(item.type === 'lost' ? item.date_lost : item.date_found)}</p>
                  <p class="text-sm text-gray-600 mt-2"><strong>Reported:</strong> ${formatDisplayDate(item.created_at)}</p>
                  <p class="text-sm text-gray-600 mt-2"><strong>Owner:</strong> ${item.first_name} ${item.last_name}</p>
                </div>
              </div>

              <!-- Description -->
              <div>
                <p class="text-sm text-gray-600"><strong>Description:</strong></p>
                <p class="text-gray-700 mt-2">${item.description || 'No description provided'}</p>
              </div>

              <!-- Distinguishing Features -->
              ${item.distinguishing_features ? `
                <div>
                  <p class="text-sm text-gray-600"><strong>Distinguishing Features:</strong></p>
                  <p class="text-gray-700 mt-2">${item.distinguishing_features}</p>
                </div>
              ` : ''}

              <!-- security Actions -->
              <div class="bg-yellow-50 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">⚙️ security Actions</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Update Item Status</label>
                    <select id="itemStatusSelect" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="Reported" ${item.status === 'Reported' ? 'selected' : ''}>Reported</option>
                      <option value="Open" ${item.status === 'Open' ? 'selected' : ''}>Open</option>
                      <option value="Claimed" ${item.status === 'Claimed' ? 'selected' : ''}>Claimed</option>
                      <option value="Returned" ${item.status === 'Returned' ? 'selected' : ''}>Returned</option>
                      <option value="Disposed" ${item.status === 'Disposed' ? 'selected' : ''}>Disposed</option>
                      <option value="Done" ${item.status === 'Done' ? 'selected' : ''}>Done</option>
                      <option value="Pending" ${item.status === 'Pending' ? 'selected' : ''}>Pending</option>
                      <option value="Verified" ${item.status === 'Verified' ? 'selected' : ''}>Verified</option>
                    </select>
                  </div>
                  <div class="flex gap-2">
                    <button id="updateStatusBtn" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" data-item-id="${item.id}">
                      Update Status
                    </button>
                    <button id="editItemBtn" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors" data-item-id="${item.id}">
                      Edit Item
                    </button>
                    <button id="deleteItemBtn" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors" data-item-id="${item.id}">
                      Delete Item
                    </button>
                  </div>
                </div>
              </div>
            </div>`;

      if (window.Drawer) {
        Drawer.show('appDrawer', contentInner, `View Item: ${item.title}`);
      } else {
        // Fallback to modal if drawer not available
        if (window.Modal) {
          Modal.show('appModal', contentInner);
        } else {
          const modalHTML = `
          <div id="itemModal" class="fixed inset-0 bg-black/50 items-center justify-center z-[1000] flex">
            <div class="bg-white rounded-2xl p-8 max-w-4xl w-[90%] max-h-[90vh] overflow-y-auto relative shadow-2xl">
              <span class="close-modal absolute top-4 right-6 text-3xl cursor-pointer text-gray-500 hover:text-gray-800 transition-colors" onclick="closeItemModal()">&times;</span>
              ${contentInner}
            </div>
          </div>`;
          document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
      }
    }
  } catch (error) {
    showError(errorMessage, 'Failed to load item details: ' + error.message);
  }
}

function closeItemModal() {
  if (window.Drawer && Drawer.isOpen('appDrawer')) {
    Drawer.hide('appDrawer');
    return;
  }
  if (window.Modal && Modal.isOpen('appModal')) {
    Modal.hide('appModal');
    return;
  }
  const modal = document.getElementById('itemModal');
  if (modal) {
    modal.remove();
  }
}

async function updateItemStatus(itemId) {
  console.log('updateItemStatus called with itemId:', itemId);
  const statusSelect = document.getElementById('itemStatusSelect');
  console.log('itemStatusSelect element:', statusSelect);

  if (!statusSelect) {
    alert('Status select element not found!');
    return;
  }

  const status = statusSelect.value;
  console.log('Selected status:', status);

  if (!status) {
    alert('Please select a status!');
    return;
  }

  // Disable the button to prevent multiple submissions
  const updateBtn = document.getElementById('updateStatusBtn');
  if (updateBtn) {
    updateBtn.disabled = true;
    updateBtn.textContent = 'Updating...';
  }

  try {
    console.log('Making API call to update status...');
    const response = await apiCall(`/items/${itemId}/status`, 'PUT', { status });
    console.log('API response:', response);

    if (response && response.item) {
      alert('Item status updated successfully!');
      closeItemModal();
      loadItems();
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Error updating item status:', error);
    alert('Failed to update item status: ' + error.message);
  } finally {
    // Re-enable the button
    if (updateBtn) {
      updateBtn.disabled = false;
      updateBtn.textContent = 'Update Status';
    }
  }
}

async function editItem(itemId) {
  const errorMessage = document.getElementById('errorMessage');

  try {
    const response = await apiCall(`/items/${itemId}`, 'GET');

    if (response) {
      const item = response;

      // Create edit modal HTML
      const modalHTML = `
        <div id="editItemModal" class="fixed inset-0 bg-black/50 items-center justify-center z-[1000] flex">
          <div class="bg-white rounded-2xl p-8 max-w-4xl w-[90%] max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <span class="close-modal absolute top-4 right-6 text-3xl cursor-pointer text-gray-500 hover:text-gray-800 transition-colors" onclick="closeEditModal()">&times;</span>

            <div class="space-y-6">
              <h2 class="text-3xl font-bold text-gray-800">✏️ Edit Item</h2>

              <form id="editItemForm" class="space-y-6">
                <!-- Item Details -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Item Title *</label>
                    <input type="text" id="editTitle" value="${item.title}" required
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select id="editCategory" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="wallet" ${item.category === 'wallet' ? 'selected' : ''}>Wallet</option>
                      <option value="phone" ${item.category === 'phone' ? 'selected' : ''}>Phone</option>
                      <option value="keys" ${item.category === 'keys' ? 'selected' : ''}>Keys</option>
                      <option value="id" ${item.category === 'id' ? 'selected' : ''}>Student/security ID</option>
                      <option value="clothing" ${item.category === 'clothing' ? 'selected' : ''}>Clothing</option>
                      <option value="bag" ${item.category === 'bag' ? 'selected' : ''}>Bag</option>
                      <option value="textbook" ${item.category === 'textbook' ? 'selected' : ''}>Textbook</option>
                      <option value="electronics" ${item.category === 'electronics' ? 'selected' : ''}>Electronics</option>
                      <option value="other" ${item.category === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                    <select id="editType" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="lost" ${item.type === 'lost' ? 'selected' : ''}>Lost</option>
                      <option value="found" ${item.type === 'found' ? 'selected' : ''}>Found</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                    <select id="editStatus" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="Reported" ${item.status === 'Reported' ? 'selected' : ''}>Reported</option>
                      <option value="Open" ${item.status === 'Open' ? 'selected' : ''}>Open</option>
                      <option value="Claimed" ${item.status === 'Claimed' ? 'selected' : ''}>Claimed</option>
                      <option value="Returned" ${item.status === 'Returned' ? 'selected' : ''}>Returned</option>
                      <option value="Disposed" ${item.status === 'Disposed' ? 'selected' : ''}>Disposed</option>
                      <option value="Done" ${item.status === 'Done' ? 'selected' : ''}>Done</option>
                      <option value="Pending" ${item.status === 'Pending' ? 'selected' : ''}>Pending</option>
                      <option value="Verified" ${item.status === 'Verified' ? 'selected' : ''}>Verified</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Campus *</label>
                    <select id="editCampus" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="Main" ${item.campus === 'Main' ? 'selected' : ''}>Main Campus</option>
                      <option value="Waterloo" ${item.campus === 'Waterloo' ? 'selected' : ''}>Waterloo Campus</option>
                      <option value="Cambridge" ${item.campus === 'Cambridge' ? 'selected' : ''}>Cambridge Campus</option>
                      <option value="Doon" ${item.campus === 'Doon' ? 'selected' : ''}>Doon Campus</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Date ${item.type === 'lost' ? 'Lost' : 'Found'} *</label>
                    <input type="date" id="editDate" value="${item.type === 'lost' ? (item.date_lost || '') : (item.date_found || '')}" required
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Location ${item.type === 'lost' ? 'Lost' : 'Found'} *</label>
                  <input type="text" id="editLocation" value="${item.location_found}" required
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea id="editDescription" rows="3"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">${item.description || ''}</textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Distinguishing Features</label>
                  <textarea id="editFeatures" rows="2"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">${item.distinguishing_features || ''}</textarea>
                </div>

                <!-- Current Image Display -->
                ${item.image_url ? `
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Current Image</label>
                    <div class="w-32 h-32 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                      <img src="${item.image_url}" alt="Current item image" class="w-full h-full object-cover">
                    </div>
                  </div>
                ` : ''}

                <!-- Image Upload -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Update Image (optional)</label>
                  <input type="file" id="editImage" accept="image/*"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-4 pt-6 border-t border-gray-200">
                  <button type="submit" class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all">
                    💾 Save Changes
                  </button>
                  <button type="button" id="cancelEditBtn" class="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all">
                    Cancel
                  </button>
                  <button type="button" id="deleteFromEditBtn" class="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all ml-auto">
                    🗑️ Delete Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      `;

      if (window.Drawer) {
        Drawer.show('appDrawer', modalHTML, `Edit Item: ${item.title}`);
      } else {
        // Fallback to modal if drawer not available
        document.body.insertAdjacentHTML('beforeend', modalHTML);
      }

      // Setup form submission
      const editForm = document.getElementById('editItemForm');
      if (editForm) {
        editForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          await handleEditItem(itemId);
        });
      }

      // Setup button handlers
      const cancelBtn = document.getElementById('cancelEditBtn');
      const deleteBtn = document.getElementById('deleteFromEditBtn');
      if (cancelBtn) cancelBtn.addEventListener('click', closeEditModal);
      if (deleteBtn) deleteBtn.addEventListener('click', () => deleteItemFromEdit(itemId));

      // Setup action buttons in the drawer/modal
      const updateStatusBtn = document.getElementById('updateStatusBtn');
      const editItemBtn = document.getElementById('editItemBtn');
      const deleteItemBtn = document.getElementById('deleteItemBtn');

      if (updateStatusBtn) {
        updateStatusBtn.addEventListener('click', () => updateItemStatus(itemId));
      }
      if (editItemBtn) {
        editItemBtn.addEventListener('click', () => editItem(itemId));
      }
      if (deleteItemBtn) {
        deleteItemBtn.addEventListener('click', () => deleteItem(itemId));
      }
    }
  } catch (error) {
    showError(errorMessage, 'Failed to load item for editing: ' + error.message);
  }
}

function closeEditModal() {
  if (window.Drawer && Drawer.isOpen('appDrawer')) {
    Drawer.hide('appDrawer');
    return;
  }
  const modal = document.getElementById('editItemModal');
  if (modal) {
    modal.remove();
  }
}

async function handleEditItem(itemId) {
  const formData = new FormData();

  // Get form values
  const title = document.getElementById('editTitle').value;
  const category = document.getElementById('editCategory').value;
  const type = document.getElementById('editType').value;
  const status = document.getElementById('editStatus').value;
  const campus = document.getElementById('editCampus').value;
  const date = document.getElementById('editDate').value;
  const location = document.getElementById('editLocation').value;
  const description = document.getElementById('editDescription').value;
  const features = document.getElementById('editFeatures').value;
  const image = document.getElementById('editImage').files[0];

  // Validate required fields
  if (!title || !category || !type || !status || !campus || !date || !location) {
    alert('Please fill in all required fields marked with *');
    return;
  }

  // Add data to FormData
  formData.append('title', title);
  formData.append('category', category);
  formData.append('type', type);
  formData.append('status', status);
  formData.append('campus', campus);
  formData.append('location_found', location);
  if (description) formData.append('description', description);
  if (features) formData.append('distinguishing_features', features);
  if (image) formData.append('image', image);

  // Add date field based on type
  const dateField = type === 'lost' ? 'date_lost' : 'date_found';
  formData.append(dateField, date);

  try {
    const response = await apiCallFormData(`/items/security/${itemId}`, 'PUT', formData);

    if (response) {
      alert('Item updated successfully!');
      closeEditModal();
      loadItems();
    }
  } catch (error) {
    alert('Failed to update item: ' + error.message);
  }
}

async function deleteItemFromEdit(itemId) {
  if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
    return;
  }

  try {
    const response = await apiCall(`/items/${itemId}`, 'DELETE');

    if (response) {
      alert('Item deleted successfully!');
      closeEditModal();
      loadItems();
    }
  } catch (error) {
    alert('Failed to delete item: ' + error.message);
  }
}

async function deleteItem(itemId) {
  if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
    return;
  }

  try {
    const response = await apiCall(`/items/${itemId}`, 'DELETE');

    if (response) {
      alert('Item deleted successfully!');
      closeItemModal();
      loadItems();
    }
  } catch (error) {
    alert('Failed to delete item: ' + error.message);
  }
}
