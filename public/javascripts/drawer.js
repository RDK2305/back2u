// Global Drawer Utility for all pages (no external dependency)
// Provides: Drawer.ensure(id), Drawer.show(id, html), Drawer.hide(id), Drawer.setContent(id, html),
// and convenience globals: openDrawer(html, id?), closeDrawer(id?)
(function () {
  const DEFAULT_ID = 'appDrawer';

  function ensure(id = DEFAULT_ID) {
    let container = document.getElementById(id);
    if (!container) {
      container = document.createElement('div');
      container.id = id;
      container.className = 'fixed inset-0 z-[1000] hidden';

      const backdrop = document.createElement('div');
      backdrop.className = 'absolute inset-0 bg-black/50 transition-opacity duration-300';

      const drawer = document.createElement('div');
      drawer.className = 'absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl transform translate-x-full transition-transform duration-300 ease-in-out';

      const header = document.createElement('div');
      header.className = 'flex items-center justify-between p-6 border-b border-gray-200';

      const title = document.createElement('h2');
      title.id = `${id}Title`;
      title.className = 'text-2xl font-bold text-gray-800';

      const closeBtn = document.createElement('button');
      closeBtn.className = 'text-3xl text-gray-500 hover:text-gray-800 transition-colors drawer-close-btn';
      closeBtn.innerHTML = '&times;';

      const body = document.createElement('div');
      body.id = `${id}Body`;
      body.className = 'flex-1 overflow-y-auto p-6';

      header.appendChild(title);
      header.appendChild(closeBtn);
      drawer.appendChild(header);
      drawer.appendChild(body);
      container.appendChild(backdrop);
      container.appendChild(drawer);
      document.body.appendChild(container);

      // Bind close handlers
      closeBtn.addEventListener('click', () => hide(id));
      backdrop.addEventListener('click', () => hide(id));
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen(id)) hide(id);
      });
    }
    return container;
  }

  function setContent(id = DEFAULT_ID, html = '', title = '') {
    const container = ensure(id);
    const body = document.getElementById(`${id}Body`);
    const titleEl = document.getElementById(`${id}Title`);
    if (body) body.innerHTML = html;
    if (titleEl) titleEl.textContent = title;
    return container;
  }

  function show(id = DEFAULT_ID, html = null, title = '') {
    const container = ensure(id);
    if (html !== null) setContent(id, html, title);
    container.classList.remove('hidden');
    // Force reflow
    container.offsetHeight;
    const drawer = container.querySelector('.transform');
    drawer.classList.remove('translate-x-full');
    return container;
  }

  function hide(id = DEFAULT_ID) {
    const container = document.getElementById(id);
    if (container) {
      const drawer = container.querySelector('.transform');
      if (drawer) {
        drawer.classList.add('translate-x-full');
        // Wait for animation to complete before hiding
        setTimeout(() => {
          container.classList.add('hidden');
        }, 300);
      }
    }
  }

  function isOpen(id = DEFAULT_ID) {
    const container = document.getElementById(id);
    return !!(container && !container.classList.contains('hidden'));
  }

  // Expose API
  window.Drawer = { ensure, setContent, show, hide, isOpen };
  window.openDrawer = function (html, title = '', id = DEFAULT_ID) { return show(id, html, title); };
  window.closeDrawer = function (id = DEFAULT_ID) { return hide(id); };
})();
