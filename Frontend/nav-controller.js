(function () {
  function initNavController() {
    // 0. Inject explicit CSS rules for active navigation highlighting
    if (!document.getElementById('nav-controller-styles')) {
      const style = document.createElement('style');
      style.id = 'nav-controller-styles';
      style.textContent = `
        .nav-active {
          font-weight: 700 !important;
          text-decoration: underline !important;
          text-decoration-color: #F48F68 !important;
          text-underline-offset: 8px !important;
          text-decoration-thickness: 3px !important;
          color: #F48F68 !important;
        }
        .nav-active-footer {
          font-weight: 700 !important;
          color: #F48F68 !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Mobile Menu elements
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuCloseBtn = document.getElementById('mobile-menu-close-btn');
    const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');

    if (mobileMenuBtn && mobileMenuCloseBtn && mobileMenuDrawer) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenuDrawer.classList.remove('translate-x-full');
        mobileMenuDrawer.classList.add('translate-x-0');
      });

      mobileMenuCloseBtn.addEventListener('click', () => {
        mobileMenuDrawer.classList.remove('translate-x-0');
        mobileMenuDrawer.classList.add('translate-x-full');
      });
    }

    const othersGroup = ['design-studio', 'blogs', 'faqs', 'hiring'];

    function getLinkKey(href) {
      if (!href) return '';
      const cleanHref = href.split('?')[0];
      if (cleanHref.endsWith('hiring.html')) return 'hiring';
      if (cleanHref.endsWith('services.html') || cleanHref.includes('#services')) return 'services';
      if (cleanHref.endsWith('how-it-works.html') || cleanHref.includes('#how-it-works')) return 'how-it-works';
      if (cleanHref.endsWith('portfolio.html') || cleanHref.includes('#portfolio')) return 'portfolio';
      if (cleanHref.endsWith('design-studio.html')) return 'design-studio';
      if (cleanHref.endsWith('blogs.html')) return 'blogs';
      if (cleanHref.endsWith('faqs.html')) return 'faqs';
      if (cleanHref.endsWith('book-a-call.html') || cleanHref.endsWith('booking-details.html')) return 'book-a-call';
      if (cleanHref.endsWith('index.html') || cleanHref.includes('#home') || cleanHref === '/' || cleanHref === '') return 'home';
      return '';
    }

    function getActiveKey() {
      const path = window.location.pathname.split('/').pop() || 'index.html';
      if (path === 'services.html') return 'services';
      if (path === 'how-it-works.html') return 'how-it-works';
      if (path === 'portfolio.html') return 'portfolio';
      if (path === 'design-studio.html') return 'design-studio';
      if (path === 'blogs.html') return 'blogs';
      if (path === 'faqs.html') return 'faqs';
      if (path === 'hiring.html') return 'hiring';
      if (path === 'book-a-call.html' || path === 'booking-details.html') return 'book-a-call';

      if (window.location.hash) {
        const hashKey = getLinkKey(window.location.hash);
        if (hashKey) return hashKey;
      }

      if (window.__currentScrollSection) {
        return window.__currentScrollSection;
      }

      return 'home';
    }

    function updateActiveLinks() {
      const activeKey = getActiveKey();

      // 1. Header Navigation Links (Desktop & Mobile Drawer)
      const headerElements = document.querySelectorAll('header nav a, header nav button, #mobile-menu-drawer nav a');
      headerElements.forEach(el => {
        const isOthersButton = el.tagName === 'BUTTON' && (el.getAttribute('data-path') === 'others' || el.textContent.includes('Others'));
        const href = el.getAttribute('href');
        const linkKey = href ? getLinkKey(href) : '';

        const isActive = linkKey === activeKey || (isOthersButton && othersGroup.includes(activeKey));

        if (isActive) {
          el.classList.add('nav-active');
        } else {
          el.classList.remove('nav-active');
        }

        // Dropdown items specifically
        if (el.closest('.group-hover\\:opacity-100') || el.closest('.shadow-xl')) {
          if (linkKey === activeKey) {
            el.classList.add('nav-active-footer');
          } else {
            el.classList.remove('nav-active-footer');
          }
        }
      });

      // 2. Footer Navigation Links
      const footerNavLinks = document.querySelectorAll('footer a');
      footerNavLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        const linkKey = getLinkKey(href);
        if (linkKey) {
          if (linkKey === activeKey) {
            link.classList.add('nav-active-footer');
          } else {
            link.classList.remove('nav-active-footer');
          }
        }
      });
    }

    // Set up scroll section observer for home page (index.html)
    const path = window.location.pathname.split('/').pop() || 'index.html';
    if (path === 'index.html' || path === '') {
      const sections = ['home', 'services', 'how-it-works', 'portfolio'];
      const sectionElements = sections.map(id => document.getElementById(id)).filter(Boolean);

      if ('IntersectionObserver' in window && sectionElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              window.__currentScrollSection = entry.target.id;
              updateActiveLinks();
            }
          });
        }, { threshold: 0.3 });

        sectionElements.forEach(sec => observer.observe(sec));
      }
    }

    updateActiveLinks();
    window.addEventListener('hashchange', updateActiveLinks);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavController);
  } else {
    initNavController();
  }
  window.addEventListener('load', initNavController);
})();
