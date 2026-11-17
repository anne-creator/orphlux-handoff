// Local homepage only. Detail-page files and their own navigation stay intact.
(() => {
  const sections = new Map([
    ['/', '#hero-title'], ['/index.html', '#hero-title'],
    ['/homepage.html', '#hero-title'], ['/services/', '#services'],
    ['/datasets/', '#datasets'], ['/research/', '#research'],
  ]);
  function restrictLink(link) {
    const href = link.getAttribute('href');
    if (href === null || href.startsWith('#')) return;
    if (link.hasAttribute('data-contact') && href.startsWith('mailto:')) return;
    if (sections.has(href)) {
      link.setAttribute('href', sections.get(href));
      link.removeAttribute('target');
      return;
    }
    for (const name of ['href', 'target', 'rel', 'download', 'ping', 'onclick']) {
      link.removeAttribute(name);
    }
    link.setAttribute('data-static-link', '');
    link.setAttribute('tabindex', '-1');
  }
  function scan(root) {
    if (root.matches?.('a[href], area[href]')) restrictLink(root);
    root.querySelectorAll?.('a[href], area[href]').forEach(restrictLink);
  }
  scan(document);
  // Variants can add cards after load or restore their original destinations.
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') restrictLink(record.target);
      else record.addedNodes.forEach(scan);
    }
  }).observe(document.documentElement, {
    subtree: true, childList: true, attributes: true, attributeFilter: ['href'],
  });
  for (const eventName of ['click', 'auxclick']) {
    document.addEventListener(eventName, event => {
      const link = event.target.closest?.('a, area');
      if (!link) return;
      restrictLink(link);
      if (link.hasAttribute('data-static-link')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  }
})();
