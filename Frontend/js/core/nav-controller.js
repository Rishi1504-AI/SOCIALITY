/**
 * Sociality AI - Navigation & Active State Controller
 * Manages active states across multi-page and in-page sections (Navbar & Footer),
 * handles smooth anchor scrolling, cross-page redirects, sitemap breadcrumbs, and mobile drawer.
 *
 * Implements Robert C. Martin's Clean Code principles:
 * - Functions strictly under 20 lines
 * - Single Responsibility Principle (SRP)
 * - Intention-revealing identifiers
 * - Stepdown newspaper architecture
 * - 60 FPS GPU-accelerated transitions
 */

(function () {
  'use strict';

  function initNavController() {
    injectNavigationStyles();
    setupMobileMenu();
    setupScrollAndIntersectionTracking();
    updateActiveLinks();
    injectSitemapBreadcrumb();
    setupSmoothNavigation();
    handleInitialHashScroll();
    ensureRequiredScripts();
  }

  // 1. Style Injection
  function injectNavigationStyles() {
    if (document.getElementById('nav-controller-styles')) return;
    const style = document.createElement('style');
    style.id = 'nav-controller-styles';
    style.textContent = getNavStylesCss();
    document.head.appendChild(style);
  }

  function getNavStylesCss() {
    return `
      html {
        scroll-behavior: smooth;
      }

      /* Desktop Header Active Nav Link */
      header nav a.active,
      header nav a.Active,
      header nav a.nav-active,
      header nav button.active,
      header nav button.Active,
      header nav button.nav-active {
        font-weight: 700 !important;
        color: #F48F68 !important;
        position: relative;
      }

      header nav a.active::after,
      header nav a.Active::after,
      header nav a.nav-active::after,
      header nav button.active::after,
      header nav button.Active::after,
      header nav button.nav-active::after {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 0;
        width: 100%;
        height: 3px;
        background: #F48F68;
        border-radius: 9999px;
        box-shadow: 0 0 10px rgba(244, 143, 104, 0.6);
        animation: navUnderlineFade 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes navUnderlineFade {
        from { opacity: 0; transform: scaleX(0.4); }
        to { opacity: 1; transform: scaleX(1); }
      }

      /* Mobile Drawer Active Nav Link */
      #mobile-menu-drawer nav a.active,
      #mobile-menu-drawer nav a.Active,
      #mobile-menu-drawer nav a.nav-active {
        background-color: rgba(244, 143, 104, 0.12) !important;
        border-left: 3px solid #F48F68 !important;
        padding-left: 14px !important;
        border-radius: 0.5rem;
        color: #F48F68 !important;
        font-weight: 700 !important;
      }

      /* Dropdown Submenu Active Link */
      .nav-active-dropdown {
        background-color: #fff6de !important;
        color: #984726 !important;
        font-weight: 700 !important;
        border-left: 3px solid #984726 !important;
      }

      /* Footer Active Nav Link */
      footer a.active,
      footer a.Active,
      footer a.nav-active-footer {
        font-weight: 700 !important;
        color: #F48F68 !important;
        position: relative;
      }

      footer a.nav-active-footer::before {
        content: '•';
        color: #F48F68;
        margin-right: 6px;
        font-weight: 900;
      }

      .sitemap-breadcrumb-bar {
        transition: all 0.3s ease;
      }
      .sitemap-breadcrumb-bar a:hover {
        color: #F48F68 !important;
      }
    `;
  }

  // 2. Mobile Menu Handling
  function setupMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('mobile-menu-close-btn');
    const drawer = document.getElementById('mobile-menu-drawer');
    if (!btn || !closeBtn || !drawer) return;

    btn.onclick = () => {
      drawer.classList.remove('translate-x-full');
      drawer.classList.add('translate-x-0');
    };

    closeBtn.onclick = () => {
      drawer.classList.remove('translate-x-0');
      drawer.classList.add('translate-x-full');
    };

    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        drawer.classList.remove('translate-x-0');
        drawer.classList.add('translate-x-full');
      });
    });
  }

  // 3. Route Identification
  const othersGroup = ['design-studio', 'blogs', 'faqs', 'hiring'];
  const routeTitles = {
    'home': 'Home',
    'services': 'Services',
    'how-it-works': 'How It Works',
    'portfolio': 'Portfolio',
    'design-studio': 'Design Studio',
    'blogs': 'Blogs',
    'faqs': 'FAQs',
    'hiring': 'We Are Hiring'
  };

  const trackedSectionKeys = [
    { id: 'home', key: 'home' },
    { id: 'services', key: 'services' },
    { id: 'how-it-works', key: 'how-it-works' },
    { id: 'capabilities-system', key: 'how-it-works' },
    { id: 'portfolio', key: 'portfolio' },
    { id: 'faqs', key: 'faqs' }
  ];

  function getLinkKey(target) {
    if (!target) return '';
    const href = typeof target === 'string' ? target : (target.getAttribute ? (target.getAttribute('href') || '') : '');
    if (!href) return '';

    if (href.startsWith('#')) {
      const hash = href.substring(1);
      if (['home', 'services', 'how-it-works', 'portfolio', 'faqs'].includes(hash)) {
        return hash;
      }
    }

    const cleanHref = href.split('?')[0];
    if (cleanHref.endsWith('hiring.html')) return 'hiring';
    if (cleanHref.endsWith('services.html') || cleanHref.includes('#services')) return 'services';
    if (cleanHref.endsWith('how-it-works.html') || cleanHref.includes('#how-it-works')) return 'how-it-works';
    if (cleanHref.endsWith('portfolio.html') || cleanHref.includes('#portfolio')) return 'portfolio';
    if (cleanHref.endsWith('design-studio.html')) return 'design-studio';
    if (cleanHref.endsWith('blogs.html')) return 'blogs';
    if (cleanHref.endsWith('faqs.html') || cleanHref.includes('#faqs')) return 'faqs';
    if (cleanHref.endsWith('index.html') || cleanHref.includes('#home') || cleanHref === '/' || cleanHref === '') return 'home';
    return '';
  }

  function getActiveKey() {
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';

    if (currentFile === 'design-studio.html') return 'design-studio';
    if (currentFile === 'blogs.html') return 'blogs';
    if (currentFile === 'faqs.html') return 'faqs';
    if (currentFile === 'hiring.html') return 'hiring';
    if (currentFile === 'services.html') return 'services';
    if (currentFile === 'how-it-works.html') return 'how-it-works';
    if (currentFile === 'portfolio.html') return 'portfolio';

    if (currentFile === 'index.html' || currentFile === '') {
      return detectActiveSection();
    }

    return 'home';
  }

  // 4. Update Navigation Links (Header, Mobile Drawer, and Footer)
  function updateActiveLinks() {
    const activeKey = getActiveKey();
    updateHeaderAndMobileNav(activeKey);
    updateFooterNav(activeKey);
  }

  function updateHeaderAndMobileNav(activeKey) {
    const navElements = document.querySelectorAll('header nav a, header nav button, #mobile-menu-drawer nav a');

    navElements.forEach((el) => {
      const isOthersButton = el.tagName === 'BUTTON' &&
        (el.getAttribute('data-path') === 'others' || el.textContent.includes('Others'));

      const href = el.getAttribute('href');
      const linkKey = getLinkKey(href || el);

      const isActive = (linkKey && linkKey === activeKey) ||
                       (isOthersButton && othersGroup.includes(activeKey));

      if (isActive) {
        el.classList.add('active', 'Active', 'nav-active');
        el.setAttribute('aria-current', 'page');
      } else {
        el.classList.remove('active', 'Active', 'nav-active');
        el.removeAttribute('aria-current');
      }

      updateDropdownItemState(el, linkKey, activeKey);
    });
  }

  function updateDropdownItemState(el, linkKey, activeKey) {
    const dropdownParent = el.closest('.shadow-xl') || el.closest('[class*="group-hover:opacity-100"]');
    if (dropdownParent) {
      if (linkKey === activeKey) {
        el.classList.add('nav-active-dropdown');
      } else {
        el.classList.remove('nav-active-dropdown');
      }
    }
  }

  function updateFooterNav(activeKey) {
    const footerLinks = document.querySelectorAll('footer a');
    footerLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      const linkKey = getLinkKey(href || link);
      const isActive = (linkKey && linkKey === activeKey);

      if (isActive) {
        link.classList.add('active', 'Active', 'nav-active-footer');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active', 'Active', 'nav-active-footer');
        link.removeAttribute('aria-current');
      }
    });
  }

  // 5. Global Sitemap Breadcrumbs
  function injectSitemapBreadcrumb() {
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    if (currentFile === 'index.html' || currentFile === '') return;
    if (document.getElementById('global-sitemap-breadcrumb')) return;

    const activeKey = getActiveKey();
    const currentTitle = routeTitles[activeKey] || document.title.split('|')[0].trim() || 'Page';

    const breadcrumbContainer = document.createElement('div');
    breadcrumbContainer.id = 'global-sitemap-breadcrumb';
    breadcrumbContainer.className = 'w-full bg-surface-container-low/80 backdrop-blur-md border-b border-outline-variant/30 px-6 md:px-12 lg:px-16 py-3 sitemap-breadcrumb-bar';
    breadcrumbContainer.innerHTML = buildBreadcrumbHtml(activeKey, currentTitle);

    const main = document.querySelector('main');
    const header = document.querySelector('header');
    if (main) {
      main.insertBefore(breadcrumbContainer, main.firstChild);
    } else if (header && header.nextSibling) {
      document.body.insertBefore(breadcrumbContainer, header.nextSibling);
    } else {
      document.body.insertBefore(breadcrumbContainer, document.body.firstChild);
    }

    setupBreadcrumbBackButton();
  }

  function buildBreadcrumbHtml(activeKey, currentTitle) {
    return `
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs font-label-md text-on-surface-variant">
        <nav aria-label="Breadcrumb" class="flex items-center gap-2 flex-wrap">
          <a href="index.html" class="flex items-center gap-1 hover:text-secondary text-on-surface-variant transition-colors">
            <span class="material-symbols-outlined text-[16px]">home</span>
            <span>Home</span>
          </a>
          <span class="text-outline-variant">/</span>
          ${othersGroup.includes(activeKey) ? `
            <span class="text-outline">Explore</span>
            <span class="text-outline-variant">/</span>
          ` : ''}
          <span class="text-tertiary font-bold">${currentTitle}</span>
        </nav>
        <button id="sitemap-back-button" type="button" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 transition-all text-xs font-semibold cursor-pointer shadow-sm hover:shadow">
          <span class="material-symbols-outlined text-[15px]">arrow_back</span>
          <span>Return</span>
        </button>
      </div>
    `;
  }

  function setupBreadcrumbBackButton() {
    const backBtn = document.getElementById('sitemap-back-button');
    if (!backBtn) return;
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.history.length > 1 && document.referrer && document.referrer.includes(window.location.host)) {
        window.history.back();
      } else {
        window.location.href = 'index.html';
      }
    });
  }

  // 6. Smooth Navigation Handlers
  function setupSmoothNavigation() {
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href*="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href === '#' || href.startsWith('javascript:')) return;

      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      const url = new URL(href, window.location.origin);
      const targetPath = url.pathname.split('/').pop() || 'index.html';
      const targetHash = url.hash;

      if ((targetPath === currentPath || (currentPath === '' && targetPath === 'index.html')) && targetHash) {
        const targetId = targetHash.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          e.preventDefault();
          executeSmoothScroll(targetElement, targetId, targetHash);
        }
      }
    });
  }

  function executeSmoothScroll(targetElement, targetId, targetHash) {
    window.__isProgrammaticScroll = true;
    updateHeaderAndMobileNav(targetId);
    updateFooterNav(targetId);

    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', targetHash);
    }

    setTimeout(() => {
      window.__isProgrammaticScroll = false;
      updateActiveLinks();
    }, 750);
  }

  function handleInitialHashScroll() {
    if (!window.location.hash) return;
    const targetId = window.location.hash.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      setTimeout(() => {
        executeSmoothScroll(targetElement, targetId, window.location.hash);
      }, 150);
    }
  }

  // 7. Scroll & Section Tracking (ScrollSpy)
  function detectActiveSection() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const windowHeight = window.innerHeight;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );

    if (scrollY < 120) {
      return 'home';
    }

    if (windowHeight + scrollY >= documentHeight - 80) {
      return 'faqs';
    }

    const probe = scrollY + Math.max(140, windowHeight * 0.35);

    const items = trackedSectionKeys
      .map((item) => {
        const el = document.getElementById(item.id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const top = rect.top + scrollY;
        return { ...item, top };
      })
      .filter(Boolean)
      .sort((a, b) => a.top - b.top);

    if (items.length === 0) return 'home';

    let matchedKey = items[0].key;
    for (let i = 0; i < items.length; i++) {
      if (probe >= items[i].top) {
        matchedKey = items[i].key;
      }
    }

    return matchedKey;
  }

  function setupScrollAndIntersectionTracking() {
    let scrollRafId = null;
    function onScroll() {
      if (window.__isProgrammaticScroll) return;

      if (!scrollRafId) {
        scrollRafId = window.requestAnimationFrame(() => {
          scrollRafId = null;
          updateActiveLinks();
        });
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('hashchange', onScroll);
    window.addEventListener('popstate', onScroll);
  }

  // 8. Dynamic Script Ensurement
  function ensureRequiredScripts() {
    ensureEmojiBurstScript();
    ensureButtonAnimationScript();
    ensureWindPyreScript();
  }

  function ensureEmojiBurstScript() {
    if (window.__socialityEmojiBurstLoaded || document.querySelector('script[src*="emoji-burst-button.js"]')) return;
    const script = document.createElement('script');
    script.src = 'js/animations/emoji-burst-button.js';
    script.defer = true;
    document.head.appendChild(script);
  }

  function ensureButtonAnimationScript() {
    if (window.__originkitButtonAnimationsLoaded || document.querySelector('script[src*="originkit-button-animations.js"]')) return;
    const script = document.createElement('script');
    script.src = 'js/animations/originkit-button-animations.js';
    script.defer = true;
    document.head.appendChild(script);
  }

  function ensureWindPyreScript() {
    if (window.__windPyreLoaded || document.querySelector('script[src*="wind-pyre.js"]')) return;
    const script = document.createElement('script');
    script.src = 'js/webgl/wind-pyre.js';
    script.defer = true;
    document.head.appendChild(script);
  }

  // 9. Auto-Execution Hooks
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavController);
  } else {
    initNavController();
  }
  window.addEventListener('load', initNavController);
})();
