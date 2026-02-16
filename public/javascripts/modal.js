// Global Modal Utility for all pages (no external dependency)
// Provides: Modal.ensure(id), Modal.show(id, html), Modal.hide(id), Modal.setContent(id, html),
// and convenience globals: openModal(html, id?), closeModal(id?)
(function () {
  const DEFAULT_ID = 'appModal';

  function ensure(id = DEFAULT_ID) {
    let container = document.getElementById(id);
    if (!container) {
      container = document.createElement('div');
      container.id = id;
      container.className = 'fixed inset-0 bg-black/50 items-center justify-center z-[1000] hidden';
      container.style.display = 'none';

      const wrapper = document.createElement('div');
      wrapper.className = 'bg-white rounded-2xl p-8 max-w-4xl w-[90%] max-h-[90vh] overflow-y-auto relative shadow-2xl';

      const closeBtn = document.createElement('span');
      closeBtn.className = 'absolute top-4 right-6 text-3xl cursor-pointer text-gray-500 hover:text-gray-800 transition-colors modal-close-btn';
      closeBtn.innerHTML = '&times;';

      const body = document.createElement('div');
      body.id = `${id}Body`;

      wrapper.appendChild(closeBtn);
      wrapper.appendChild(body);
      container.appendChild(wrapper);
      document.body.appendChild(container);

      // Bind close handlers
      closeBtn.addEventListener('click', () => hide(id));
      container.addEventListener('click', (e) => {
        if (e.target === container) hide(id);
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen(id)) hide(id);
      });
    }
    return container;
  }

  function setContent(id = DEFAULT_ID, html = '') {
    const container = ensure(id);
    const body = document.getElementById(`${id}Body`);
    if (body) body.innerHTML = html;
    return container;
  }

  function show(id = DEFAULT_ID, html = null) {
    const container = ensure(id);
    if (html !== null) setContent(id, html);
    container.classList.remove('hidden');
    container.style.display = 'flex';
    return container;
  }

  function hide(id = DEFAULT_ID) {
    const container = document.getElementById(id);
    const body = document.getElementById(`${id}Body`);
    if (container) {
      container.style.display = 'none';
      container.classList.add('hidden');
    }
    if (body) body.innerHTML = '';
  }

  function isOpen(id = DEFAULT_ID) {
    const container = document.getElementById(id);
    return !!(container && container.style.display !== 'none' && !container.classList.contains('hidden'));
  }

  // Expose API
  window.Modal = { ensure, setContent, show, hide, isOpen };
  window.openModal = function (html, id = DEFAULT_ID) { return show(id, html); };
  window.closeModal = function (id = DEFAULT_ID) { return hide(id); };
})();
