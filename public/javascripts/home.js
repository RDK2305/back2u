// Home page functionality
let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {
  const reportLostBtn = document.getElementById('reportLostBtn');
  const browseLostBtn = document.getElementById('browseLostBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (reportLostBtn) {
    reportLostBtn.addEventListener('click', () => {
      if (isAuthenticated()) {
        window.location.href = '/report-lost.html';
      } else {
        window.location.href = '/login.html';
      }
    });
  }

  if (browseLostBtn) {
    browseLostBtn.addEventListener('click', () => {
      if (isAuthenticated()) {
        window.location.href = '/browse-found.html';
      } else {
        window.location.href = '/login.html';
      }
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToPage(currentPage + 1));

  // Load found items
  loadFoundItems();

  // Update navbar
  updateNavbar();
});

async function loadFoundItems() {
  const container = document.getElementById('foundItemsContainer');
  const paginationContainer = document.getElementById('paginationContainer');

  try {
    container.innerHTML = '<p>Loading items...</p>';

    const query = new URLSearchParams();
    query.append('type', 'found');
    query.append('status', 'Open');
    query.append('limit', 8);
    query.append('page', currentPage);

    const response = await apiCall(`/items?${query.toString()}`, 'GET');

    if (response && response.data) {
      const items = response.data;

      if (items.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center py-8">No found items at the moment.</p>';
        paginationContainer.style.display = 'none';
      } else {
        container.innerHTML = items.map(item => `
          <div class="bg-white rounded-lg overflow-hidden shadow-md transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer" onclick="handleItemClick(${item.id})">
            <div class="w-full h-52 bg-gray-100 flex items-center justify-center text-5xl ${!item.image_url ? 'bg-gradient-to-br from-gray-100 to-gray-200' : ''}">
              ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}" class="w-full h-full object-cover">` : '📦'}
            </div>
            <div class="p-6">
              <span class="inline-block bg-gray-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium mb-2">${getCategoryName(item.category)}</span>
              <h3 class="text-lg font-semibold text-gray-800">
                ${item.title}
              </h3>
              <div class="text-sm text-gray-600 my-2">
                <p><strong>Campus:</strong> ${item.campus}</p>
                <p><strong>Location:</strong> ${item.location_found}</p>
                <p><strong>Posted:</strong> ${formatDisplayDate(item.created_at)}</p>
              </div>
              <span class="inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusClass(item.status)}">${item.status}</span>
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
    container.innerHTML = '<p class="col-span-full text-center py-8 text-red-700">Error loading items. Please try again.</p>';
  }
}

function goToPage(page) {
  currentPage = page;
  loadFoundItems();
}

function handleItemClick(itemId) {
  if (isAuthenticated()) {
    window.location.href = `/browse-found.html?item=${itemId}`;
  } else {
    window.location.href = '/login.html';
  }
}
