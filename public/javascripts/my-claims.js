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
              <div class="flex gap-2 flex-wrap">
                <button onclick="openMessagingModal(${claim.id})" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  💬 Send Message
                </button>
                ${(claim.status === 'verified' || claim.status === 'completed') ? `
                  <button onclick="openRatingModal(${claim.id}, ${claim.claimer_id === user.id ? claim.owner_id : claim.claimer_id})" class="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors">
                    ⭐ Rate User
                  </button>
                ` : ''}
                ${claim.claimer_id === user.id && claim.status === 'pending' ? `
                  <button onclick="cancelClaim(${claim.id})" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                    Cancel Claim
                  </button>
                ` : ''}
              </div>

              <!-- Ratings Display Section -->
              <div id="ratingsSection_${claim.id}" class="mt-4 hidden">
                <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h4 class="font-semibold text-gray-700 mb-3">⭐ Ratings for this Claim</h4>
                  <div id="ratingsContent_${claim.id}">Loading ratings...</div>
                </div>
              </div>
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

// =============================================
// MESSAGING SYSTEM FUNCTIONS
// =============================================

let currentMessagingClaimId = null;

async function openMessagingModal(claimId) {
  console.log('Opening messaging modal for claim:', claimId);
  currentMessagingClaimId = claimId;
  
  // Close the claim details modal first
  closeClaimModal();
  
  const messagingModal = document.getElementById('messagingModal');
  if (!messagingModal) {
    console.error('Messaging modal not found');
    return;
  }

  // Show the modal
  messagingModal.classList.remove('hidden');

  // Load messages for this claim
  await loadMessages(claimId);

  // Setup event listeners
  const sendBtn = document.getElementById('sendMessageBtn');
  const closeBtn = document.getElementById('closeMessagingBtn');
  const closeIcon = document.getElementById('closeMessagingModal');

  if (sendBtn) {
    sendBtn.onclick = () => handleSendMessage(claimId);
  }
  if (closeBtn) {
    closeBtn.onclick = closeMessagingModal;
  }
  if (closeIcon) {
    closeIcon.onclick = closeMessagingModal;
  }

  // Auto-refresh messages every 10 seconds
  const refreshInterval = setInterval(async () => {
    if (!messagingModal.classList.contains('hidden')) {
      await loadMessages(claimId);
    } else {
      clearInterval(refreshInterval);
    }
  }, 10000);
}

function closeMessagingModal() {
  const messagingModal = document.getElementById('messagingModal');
  if (messagingModal) {
    messagingModal.classList.add('hidden');
  }
  currentMessagingClaimId = null;
}

async function loadMessages(claimId) {
  try {
    const response = await getClaimMessages(claimId);
    
    if (response && response.data) {
      displayMessages(response.data);
    } else {
      console.warn('No messages found or error loading messages');
    }
  } catch (error) {
    console.error('Failed to load messages:', error);
  }
}

function displayMessages(messages) {
  const messagesDisplay = document.getElementById('messagesDisplay');
  if (!messagesDisplay) {
    console.error('Messages display area not found');
    return;
  }

  if (!messages || messages.length === 0) {
    messagesDisplay.innerHTML = '<div class="flex items-center justify-center h-full"><p class="text-center text-gray-500">No messages yet.<br>Start the conversation!</p></div>';
    return;
  }

  const user = getUser();
  const messageHTML = messages.map(msg => {
    const isSent = msg.sender_id === user.id;
    const time = new Date(msg.created_at);
    const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const dateStr = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const senderName = isSent ? 'You' : (msg.sender_name || 'Unknown');
    
    return `
      <div class="flex ${isSent ? 'justify-end' : 'justify-start'} mb-4">
        <div class="flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[70%]">
          <div class="text-xs font-semibold text-gray-600 mb-1">${senderName}</div>
          <div class="px-4 py-3 rounded-2xl ${isSent ? 'bg-green-600 text-white rounded-br-none' : 'bg-gray-300 text-gray-800 rounded-bl-none'} shadow-sm break-words">
            ${msg.message}
          </div>
          <div class="text-xs text-gray-500 mt-1">${dateStr} at ${timeStr}</div>
        </div>
      </div>
    `;
  }).join('');

  messagesDisplay.innerHTML = messageHTML;
  // Scroll to bottom
  messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
}

async function handleSendMessage(claimId) {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();

  if (!message) {
    alert('Please enter a message');
    return;
  }

  try {
    // Get claim details to find receiver
    const claimResponse = await apiCall(`/claims/${claimId}`, 'GET');
    if (!claimResponse) {
      alert('Failed to load claim details');
      return;
    }

    const claim = claimResponse;
    const user = getUser();
    
    // Determine receiver (the other party in the claim)
    const receiverId = claim.claimer_id === user.id ? claim.owner_id : claim.claimer_id;

    // Send message
    const response = await sendMessage(claimId, receiverId, message);

    if (response) {
      messageInput.value = '';
      // Reload messages
      await loadMessages(claimId);
    } else {
      alert('Failed to send message');
    }
  } catch (error) {
    alert('Error sending message: ' + error.message);
    console.error('Send message error:', error);
  }
}

// =============================================
// RATING SYSTEM FUNCTIONS
// =============================================

let ratingModalClaimId = null;
let ratingModalUserId = null;
let selectedStars = 0;

async function openRatingModal(claimId, rateeUserId) {
  ratingModalClaimId = claimId;
  ratingModalUserId = rateeUserId;
  selectedStars = 0;

  // Close claim modal first
  closeClaimModal();

  // Check if already rated this claim
  let existingRating = null;
  try {
    const ratingResp = await apiCall(`/ratings/claim/${claimId}`);
    if (ratingResp && ratingResp.data) {
      const user = getUser();
      existingRating = ratingResp.data.find(r => r.rater_id === user.id);
    }
  } catch (e) { /* no existing rating */ }

  const modalHtml = `
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <span class="text-4xl">⭐</span>
        <div>
          <h2 class="text-2xl font-bold text-gray-800">${existingRating ? 'Update Your Rating' : 'Rate User'}</h2>
          <p class="text-gray-500 text-sm">Share your experience with this claim</p>
        </div>
      </div>

      ${existingRating ? `
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          📝 You previously rated this user <strong>${existingRating.rating} star${existingRating.rating !== 1 ? 's' : ''}</strong>. Submitting again will update your rating.
        </div>` : ''}

      <div class="text-center">
        <p class="text-gray-600 mb-4 font-medium">How was your experience?</p>
        <div id="starRatingContainer" class="flex justify-center gap-2 mb-2">
          ${[1,2,3,4,5].map(s => `
            <button type="button" onclick="setStarRating(${s})" id="star_${s}"
              class="text-5xl transition-transform hover:scale-110 cursor-pointer star-btn"
              style="color: ${existingRating && existingRating.rating >= s ? '#f59e0b' : '#d1d5db'}; background: none; border: none;">★</button>
          `).join('')}
        </div>
        <p id="starLabel" class="text-sm font-semibold text-gray-500 h-5">${existingRating ? getRatingLabel(existingRating.rating) : 'Click to rate'}</p>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Comment (optional)</label>
        <textarea id="ratingComment" rows="3"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none text-sm"
          placeholder="Share your experience with this user..."
          maxlength="500">${existingRating ? (existingRating.comment || '') : ''}</textarea>
        <p class="text-xs text-gray-400 text-right mt-1"><span id="commentCount">${existingRating ? (existingRating.comment || '').length : 0}</span>/500</p>
      </div>

      <div id="ratingError" class="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg hidden text-sm"></div>
      <div id="ratingSuccess" class="bg-green-50 border-l-4 border-green-500 text-green-700 p-3 rounded-lg hidden text-sm"></div>

      <div class="flex gap-3">
        <button onclick="submitRating()" class="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
          ⭐ Submit Rating
        </button>
        <button onclick="closeClaimModal()" class="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all">
          Cancel
        </button>
      </div>
    </div>`;

  if (window.Modal) {
    Modal.show('appModal', modalHtml);
  }

  // Set existing rating stars if applicable
  if (existingRating) {
    selectedStars = existingRating.rating;
    updateStarDisplay(selectedStars);
  }

  // Comment character counter
  setTimeout(() => {
    const commentField = document.getElementById('ratingComment');
    if (commentField) {
      commentField.addEventListener('input', () => {
        document.getElementById('commentCount').textContent = commentField.value.length;
      });
    }
  }, 100);
}

function setStarRating(stars) {
  selectedStars = stars;
  updateStarDisplay(stars);
  const label = document.getElementById('starLabel');
  if (label) label.textContent = getRatingLabel(stars);
}

function updateStarDisplay(stars) {
  for (let i = 1; i <= 5; i++) {
    const star = document.getElementById(`star_${i}`);
    if (star) star.style.color = i <= stars ? '#f59e0b' : '#d1d5db';
  }
}

function getRatingLabel(stars) {
  const labels = { 1: '😞 Poor', 2: '😐 Fair', 3: '🙂 Good', 4: '😊 Very Good', 5: '🤩 Excellent!' };
  return labels[stars] || 'Click to rate';
}

async function submitRating() {
  const errorDiv = document.getElementById('ratingError');
  const successDiv = document.getElementById('ratingSuccess');

  if (selectedStars === 0) {
    errorDiv.textContent = 'Please select a star rating before submitting.';
    errorDiv.classList.remove('hidden');
    return;
  }

  errorDiv.classList.add('hidden');
  const comment = (document.getElementById('ratingComment')?.value || '').trim();

  try {
    const response = await apiCall('/ratings', 'POST', {
      claim_id: ratingModalClaimId,
      ratee_id: ratingModalUserId,
      rating: selectedStars,
      comment: comment || null
    });

    if (response) {
      successDiv.textContent = `✅ Rating submitted successfully! You gave ${selectedStars} star${selectedStars !== 1 ? 's' : ''}.`;
      successDiv.classList.remove('hidden');
      setTimeout(() => closeClaimModal(), 2000);
    }
  } catch (error) {
    errorDiv.textContent = 'Failed to submit rating: ' + (error.message || 'Unknown error');
    errorDiv.classList.remove('hidden');
  }
}
