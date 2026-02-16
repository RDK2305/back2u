// My Claims page functionality
document.addEventListener('DOMContentLoaded', async () => {
  redirectToLoginIfNeeded();

  const user = getUser();

  // Update user info in sidebar
  if (user) {
    document.getElementById('userName').textContent = `${user.first_name} ${user.last_name}`;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userRole').textContent = user.role === 'security' ? 'security' : 'Student';
  }

  // Check if we need to view a specific claim
  const urlParams = new URLSearchParams(window.location.search);
  const viewClaimId = urlParams.get('viewClaim');
  if (viewClaimId) {
    // Remove the parameter from URL
    window.history.replaceState({}, document.title, window.location.pathname);
    // View the specific claim
    setTimeout(() => viewClaim(viewClaimId), 500);
  }

  // Load claims
  try {
    const response = await apiCall('/claims/user/my-claims', 'GET');

    if (response && response.data) {
      const claims = response.data;
      const container = document.getElementById('claimsContainer');
      const emptyState = document.getElementById('emptyState');

      if (claims.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
      } else {
        emptyState.style.display = 'none';

        // Render claims
        container.innerHTML = claims.map(claim => `
          <div class="bg-white rounded-lg p-6 mb-4 shadow-md flex gap-6 items-start">
            <div class="w-40 h-32 bg-gray-100 rounded flex items-center justify-center text-3xl flex-shrink-0">
              ${claim.item_image ? `<img src="${claim.item_image}" alt="${claim.item_title}" class="w-full h-full object-cover rounded">` : '📦'}
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">${claim.item_title}</h3>
              <div class="flex gap-8 flex-wrap my-3">
                <div class="text-sm text-gray-600">
                  <strong>Claim Status:</strong> <span class="inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStatusClass(claim.status)}">${claim.status}</span>
                </div>
                <div class="text-sm text-gray-600">
                  <strong>Submitted:</strong> ${formatDisplayDate(claim.created_at)}
                </div>
                <div class="text-sm text-gray-600">
                  <strong>Type:</strong> ${claim.claimer_id === user.id ? 'My Claim' : 'Claim on My Item'}
                </div>
              </div>
              ${claim.verification_notes ? `<p class="text-sm"><strong>Notes:</strong> ${claim.verification_notes}</p>` : ''}
              <div class="flex gap-2 flex-wrap">
                <button class="px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700 rounded font-medium cursor-pointer" onclick="viewClaim(${claim.id})">View Details</button>
              </div>
            </div>
          </div>
        `).join('');
      }
    }
  } catch (error) {
    const errorMessage = document.getElementById('errorMessage');
    showError(errorMessage, error.message);
  }
});

async function viewClaim(claimId) {
  console.log('viewClaim called with claimId:', claimId);
  const errorMessage = document.getElementById('errorMessage');

  try {
    const response = await apiCall(`/claims/${claimId}`, 'GET');

    if (response) {
      const claim = response;
      const user = getUser();

      // Build content for modal and show via global Modal if available
      const contentInner = `
            <div class="space-y-6">
              <h2 class="text-3xl font-bold text-gray-800">Claim Details</h2>

              <!-- Item Information -->
              <div class="bg-gray-50 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">📦 Item Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-4xl overflow-hidden">
                    ${claim.item_image ? `<img src="${claim.item_image}" alt="${claim.item_title}" class="w-full h-full object-cover rounded-lg">` : '📦'}
                  </div>
                  <div class="space-y-2">
                    <p class="text-lg font-semibold text-gray-800">${claim.item_title}</p>
                    <p class="text-sm text-gray-600"><strong>Status:</strong> <span class="inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(claim.status)}">${claim.status}</span></p>
                    <p class="text-sm text-gray-600"><strong>Claim Submitted:</strong> ${formatDisplayDate(claim.created_at)}</p>
                    ${claim.verification_notes ? `<p class="text-sm text-gray-600"><strong>Notes:</strong> ${claim.verification_notes}</p>` : ''}
                  </div>
                </div>
              </div>

              <!-- Claimant Information -->
              <div class="bg-blue-50 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">👤 Claimant Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-600"><strong>Name:</strong> ${claim.claimer_first} ${claim.claimer_last}</p>
                    <p class="text-sm text-gray-600"><strong>Type:</strong> ${claim.claimer_id === user.id ? 'You' : 'Other User'}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600"><strong>Owner:</strong> ${claim.owner_first} ${claim.owner_last}</p>
                    <p class="text-sm text-gray-600"><strong>Relationship:</strong> ${claim.owner_id === user.id ? 'Your Item' : 'Other User\'s Item'}</p>
                  </div>
                </div>
              </div>

              <!-- security Actions (only for security) -->
              ${user && user.role === 'security' ? `
                <div class="bg-yellow-50 rounded-lg p-6">
                  <h3 class="text-xl font-semibold text-gray-800 mb-4">⚙️ security Actions</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Update Claim Status</label>
                      <select id="claimStatusSelect" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="pending" ${claim.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="verified" ${claim.status === 'verified' ? 'selected' : ''}>Verified</option>
                        <option value="rejected" ${claim.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                        <option value="completed" ${claim.status === 'completed' ? 'selected' : ''}>Completed</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text.sm font-medium text-gray-700 mb-2">Verification Notes</label>
                      <textarea id="verificationNotes" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add notes about the verification process...">${claim.verification_notes || ''}</textarea>
                    </div>
                    <div class="flex gap-2">
                      <button onclick="updateClaimStatus(${claim.id})" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        Update Claim
                      </button>
                      <button onclick="deleteClaim(${claim.id})" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                        Delete Claim
                      </button>
                    </div>
                  </div>
                </div>
              ` : ''}

              <!-- User Actions -->
              ${claim.claimer_id === user.id && claim.status === 'pending' ? `
                <div class="flex gap-2">
                  <button onclick="cancelClaim(${claim.id})" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                    Cancel Claim
                  </button>
                </div>
              ` : ''}
            </div>`;

      if (window.Modal) {
        Modal.show('appModal', contentInner);
      } else {
        // Fallback to legacy injection wrapper
        const legacy = `
        <div id="claimModal" class="fixed inset-0 bg-black/50 items-center justify-center z-[1000] flex">
          <div class="bg-white rounded-2xl p-8 max-w-4xl w-[90%] max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <span class="close-modal absolute top-4 right-6 text-3xl cursor-pointer text-gray-500 hover:text-gray-800 transition-colors" onclick="closeClaimModal()">&times;</span>
            ${contentInner}
          </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', legacy);
      }
    }
  } catch (error) {
    showError(errorMessage, 'Failed to load claim details: ' + error.message);
  }
}

function closeClaimModal() {
  if (window.Modal && Modal.isOpen('appModal')) {
    Modal.hide('appModal');
    return;
  }
  const modal = document.getElementById('claimModal');
  if (modal) {
    modal.remove();
  }
}

async function updateClaimStatus(claimId) {
  const status = document.getElementById('claimStatusSelect').value;
  const verificationNotes = document.getElementById('verificationNotes').value;

  try {
    const response = await apiCall(`/claims/${claimId}`, 'PUT', {
      status,
      verification_notes: verificationNotes
    });

    if (response) {
      alert('Claim updated successfully!');
      closeClaimModal();
      // Reload the page to refresh claims
      window.location.reload();
    }
  } catch (error) {
    alert('Failed to update claim: ' + error.message);
  }
}

async function deleteClaim(claimId) {
  if (!confirm('Are you sure you want to delete this claim?')) {
    return;
  }

  try {
    const response = await apiCall(`/claims/${claimId}`, 'DELETE');

    if (response) {
      alert('Claim deleted successfully!');
      closeClaimModal();
      // Reload the page to refresh claims
      window.location.reload();
    }
  } catch (error) {
    alert('Failed to delete claim: ' + error.message);
  }
}

async function cancelClaim(claimId) {
  if (!confirm('Are you sure you want to cancel this claim?')) {
    return;
  }

  try {
    const response = await apiCall(`/claims/${claimId}`, 'DELETE');

    if (response) {
      alert('Claim cancelled successfully!');
      closeClaimModal();
      // Reload the page to refresh claims
      window.location.reload();
    }
  } catch (error) {
    alert('Failed to cancel claim: ' + error.message);
  }
}
