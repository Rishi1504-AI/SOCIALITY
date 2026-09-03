(function () {
  function initNavController() {
    // 1. Inject explicit CSS rules for active navigation highlighting and smooth transitions
    if (!document.getElementById('nav-controller-styles')) {
      const style = document.createElement('style');
      style.id = 'nav-controller-styles';
      style.textContent = `
        /* Smooth scrolling across the application */
        html {
          scroll-behavior: smooth;
        }

        /* Active Navigation Link Styling (supports .active, .Active, .nav-active) */
        .active, .Active, .nav-active {
          font-weight: 700 !important;
          color: #F48F68 !important;
          position: relative;
        }

        /* Desktop Header Active indicator underline */
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

        /* Mobile drawer active link styling */
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

        /* Dropdown active item */
        .nav-active-dropdown {
          background-color: #fff6de !important;
          color: #984726 !important;
          font-weight: 700 !important;
          border-left: 3px solid #984726 !important;
        }

        /* Footer active link */
        .nav-active-footer {
          font-weight: 700 !important;
          color: #F48F68 !important;
          text-decoration: underline !important;
          text-underline-offset: 4px !important;
        }

        /* Global Sitemap Breadcrumb Bar */
        .sitemap-breadcrumb-bar {
          transition: all 0.3s ease;
        }
        .sitemap-breadcrumb-bar a:hover {
          color: #F48F68 !important;
        }
      `;
      document.head.appendChild(style);
    }

    // 2. Mobile Menu interactions
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuCloseBtn = document.getElementById('mobile-menu-close-btn');
    const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');

    if (mobileMenuBtn && mobileMenuCloseBtn && mobileMenuDrawer) {
      mobileMenuBtn.onclick = () => {
        mobileMenuDrawer.classList.remove('translate-x-full');
        mobileMenuDrawer.classList.add('translate-x-0');
      };

      mobileMenuCloseBtn.onclick = () => {
        mobileMenuDrawer.classList.remove('translate-x-0');
        mobileMenuDrawer.classList.add('translate-x-full');
      };

      // Close drawer on link click
      mobileMenuDrawer.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          mobileMenuDrawer.classList.remove('translate-x-0');
          mobileMenuDrawer.classList.add('translate-x-full');
        });
      });
    }

    // 3. Route Identification Mapping
    const othersGroup = ['design-studio', 'blogs', 'faqs', 'hiring'];

    // Map of recognized routes and their user-facing breadcrumb labels
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

    function normalizePath(href) {
      if (!href) return '';
      try {
        const url = new URL(href, window.location.origin);
        return url.pathname.split('/').pop() || 'index.html';
      } catch (e) {
        return href.split('?')[0].split('#')[0].split('/').pop() || 'index.html';
      }
    }

    function getLinkKey(link) {
      const href = link.getAttribute('href') || '';
      if (href.startsWith('#')) {
        const hash = href.substring(1);
        if (['home', 'services', 'how-it-works', 'portfolio', 'faqs'].includes(hash)) {
          return hash;
        }
      }
      if (!href) return '';
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

      // Specific multi-page route detections
      if (currentFile === 'design-studio.html') return 'design-studio';
      if (currentFile === 'blogs.html') return 'blogs';
      if (currentFile === 'faqs.html') return 'faqs';
      if (currentFile === 'hiring.html') return 'hiring';

      // If on dedicated services / how-it-works / portfolio HTML files
      if (currentFile === 'services.html') return 'services';
      if (currentFile === 'how-it-works.html') return 'how-it-works';
      if (currentFile === 'portfolio.html') return 'portfolio';

      // If on index.html (or root /): scroll spy is primary authority
      if (currentFile === 'index.html' || currentFile === '') {
        if (window.__currentScrollSection) {
          return window.__currentScrollSection;
        }
        if (window.location.hash) {
          const hashKey = getLinkKey(window.location.hash);
          if (hashKey) return hashKey;
        }
      }

      return 'home';
    }

    // 4. Update Navigation Links (Applies .active, .Active, and .nav-active)
    function updateActiveLinks() {
      const activeKey = getActiveKey();

      // Desktop nav links, buttons, and mobile drawer items
      const navElements = document.querySelectorAll('header nav a, header nav button, #mobile-menu-drawer nav a');
      
      navElements.forEach(el => {
        const isOthersButton = el.tagName === 'BUTTON' && 
          (el.getAttribute('data-path') === 'others' || el.textContent.includes('Others'));
        
        const href = el.getAttribute('href');
        const linkKey = getLinkKey(href, el);

        const isActive = (linkKey && linkKey === activeKey) || 
                         (isOthersButton && othersGroup.includes(activeKey));

        if (isActive) {
          el.classList.add('active', 'Active', 'nav-active');
          el.setAttribute('aria-current', 'page');
        } else {
          el.classList.remove('active', 'Active', 'nav-active');
          el.removeAttribute('aria-current');
        }

        // Submenu dropdown links
        const dropdownParent = el.closest('.shadow-xl') || el.closest('[class*="group-hover:opacity-100"]');
        if (dropdownParent) {
          if (linkKey === activeKey) {
            el.classList.add('nav-active-dropdown');
          } else {
            el.classList.remove('nav-active-dropdown');
          }
        }
      });

      // Footer Navigation links
      const footerNavLinks = document.querySelectorAll('footer a');
      footerNavLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        const linkKey = getLinkKey(href, link);
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

    // 5. Global Sitemap Breadcrumbs & Return Navigation
    function injectSitemapBreadcrumb() {
      const currentFile = window.location.pathname.split('/').pop() || 'index.html';
      // Only inject on subpages (not the home index landing)
      if (currentFile === 'index.html' || currentFile === '') {
        return;
      }

      // Check if breadcrumb bar is already injected
      if (document.getElementById('global-sitemap-breadcrumb')) {
        return;
      }

      const activeKey = getActiveKey();
      const currentTitle = routeTitles[activeKey] || document.title.split('|')[0].trim() || 'Page';

      const breadcrumbContainer = document.createElement('div');
      breadcrumbContainer.id = 'global-sitemap-breadcrumb';
      breadcrumbContainer.className = 'w-full bg-surface-container-low/80 backdrop-blur-md border-b border-outline-variant/30 px-6 md:px-12 lg:px-16 py-3 sitemap-breadcrumb-bar';
      
      breadcrumbContainer.innerHTML = `
        <div class="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs font-label-md text-on-surface-variant">
          <!-- Left: Sitemap Breadcrumbs -->
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

          <!-- Right: Seamless Back / Return Button -->
          <button id="sitemap-back-button" type="button" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 transition-all text-xs font-semibold cursor-pointer shadow-sm hover:shadow">
            <span class="material-symbols-outlined text-[15px]">arrow_back</span>
            <span>Return</span>
          </button>
        </div>
      `;

      const header = document.querySelector('header');
      const main = document.querySelector('main');

      if (main) {
        main.insertBefore(breadcrumbContainer, main.firstChild);
      } else if (header && header.nextSibling) {
        document.body.insertBefore(breadcrumbContainer, header.nextSibling);
      } else {
        document.body.insertBefore(breadcrumbContainer, document.body.firstChild);
      }

      // Attach seamless return listener with fallback to homepage
      const backBtn = document.getElementById('sitemap-back-button');
      if (backBtn) {
        backBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.history.length > 1 && document.referrer && document.referrer.includes(window.location.host)) {
            window.history.back();
          } else {
            window.location.href = 'index.html';
          }
        });
      }
    }

    // 6. Smooth In-Page and Cross-Page Navigation Transitions
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

        // If navigating to an in-page section on the current page
        if ((targetPath === currentPath || (currentPath === '' && targetPath === 'index.html')) && targetHash) {
          const targetId = targetHash.substring(1);
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
            e.preventDefault();
            window.__currentScrollSection = targetId;
            window.__isProgrammaticScroll = true;
            updateActiveLinks();

            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

            if (window.history && window.history.replaceState) {
              window.history.replaceState(null, '', targetHash);
            }

            // Release programmatic scroll flag after animation completes
            setTimeout(() => {
              window.__isProgrammaticScroll = false;
              const activeSec = detectActiveSection();
              if (activeSec && activeSec !== window.__currentScrollSection) {
                window.__currentScrollSection = activeSec;
                updateActiveLinks();
              }
            }, 800);
          }
        }
      });
    }

    // 7. Viewport Section Coverage Detection & Observer Setup
    const trackedSectionIds = ['home', 'services', 'how-it-works', 'portfolio'];
    const sectionElements = trackedSectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean);

    function detectActiveSection() {
      if (sectionElements.length === 0) return null;

      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 1. Top of page boundary
      if (scrollY < 100) {
        return sectionElements[0].id;
      }

      // 2. Bottom of document boundary: guarantee last section activates
      if (windowHeight + scrollY >= documentHeight - 60) {
        return sectionElements[sectionElements.length - 1].id;
      }

      // 3. Focal reading line: 30% down from viewport top (below the fixed header)
      const focalLine = Math.max(140, windowHeight * 0.3);

      for (let i = 0; i < sectionElements.length; i++) {
        const rect = sectionElements[i].getBoundingClientRect();
        if (rect.top <= focalLine && rect.bottom > focalLine) {
          return sectionElements[i].id;
        }
      }

      // 4. Fallback: section with greatest visible height in viewport
      let maxVisibleHeight = -1;
      let dominantSectionId = sectionElements[0].id;

      sectionElements.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(windowHeight, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);

        if (visibleHeight > maxVisibleHeight) {
          maxVisibleHeight = visibleHeight;
          dominantSectionId = sec.id;
        }
      });

      return dominantSectionId;
    }

    function setupScrollAndIntersectionTracking() {
      if (sectionElements.length === 0) return;

      // Set initial active section on page load
      const initialSection = detectActiveSection();
      if (initialSection) {
        window.__currentScrollSection = initialSection;
      }

      // Intersection Observer for continuous visibility monitoring
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          if (window.__isProgrammaticScroll) return;

          const currentSec = detectActiveSection();
          if (currentSec && currentSec !== window.__currentScrollSection) {
            window.__currentScrollSection = currentSec;
            updateActiveLinks();
          }
        }, {
          root: null,
          rootMargin: '-15% 0px -35% 0px',
          threshold: [0, 0.25, 0.5, 0.75, 1.0]
        });

        sectionElements.forEach(sec => observer.observe(sec));
      }

      // Scroll event listener throttled via requestAnimationFrame for smooth 60fps tracking
      let scrollRafId = null;
      function onScroll() {
        if (window.__isProgrammaticScroll) return;

        if (!scrollRafId) {
          scrollRafId = window.requestAnimationFrame(() => {
            scrollRafId = null;
            const activeId = detectActiveSection();
            if (activeId && activeId !== window.__currentScrollSection) {
              window.__currentScrollSection = activeId;
              updateActiveLinks();
            }
          });
        }
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
    }

    // 8. Navigation Listeners (Hashchange, Popstate, and History API wrapping)
    window.addEventListener('hashchange', () => {
      const activeSec = detectActiveSection();
      if (activeSec) {
        window.__currentScrollSection = activeSec;
      }
      updateActiveLinks();
    });

    window.addEventListener('popstate', () => {
      const activeSec = detectActiveSection();
      if (activeSec) {
        window.__currentScrollSection = activeSec;
      }
      updateActiveLinks();
    });

    // Intercept pushState & replaceState so route updates dynamically
    if (window.history && !window.__historyPushPatched) {
      window.__historyPushPatched = true;
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      history.pushState = function () {
        originalPushState.apply(this, arguments);
        updateActiveLinks();
      };
      history.replaceState = function () {
        originalReplaceState.apply(this, arguments);
        updateActiveLinks();
      };
    }

    // Execute immediately
    setupScrollAndIntersectionTracking();
    updateActiveLinks();
    injectSitemapBreadcrumb();
    setupSmoothNavigation();
    ensureEmojiBurstScript();
    ensureButtonAnimationScript();
    ensureWindPyreScript();
  }

  function ensureEmojiBurstScript() {
    if (window.__socialityEmojiBurstLoaded || document.querySelector('script[src*="emoji-burst-button.js"]')) {
      return;
    }
    const script = document.createElement('script');
    script.src = 'emoji-burst-button.js';
    script.defer = true;
    document.head.appendChild(script);
  }

  function ensureButtonAnimationScript() {
    if (window.__originkitButtonAnimationsLoaded || document.querySelector('script[src*="originkit-button-animations.js"]')) {
      return;
    }
    const script = document.createElement('script');
    script.src = 'originkit-button-animations.js';
    script.defer = true;
    document.head.appendChild(script);
  }

  function ensureWindPyreScript() {
    if (window.__windPyreLoaded || document.querySelector('script[src*="wind-pyre.js"]')) {
      return;
    }
    const script = document.createElement('script');
    script.src = 'wind-pyre.js';
    script.defer = true;
    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavController);
  } else {
    initNavController();
  }
  window.addEventListener('load', initNavController);
})();
