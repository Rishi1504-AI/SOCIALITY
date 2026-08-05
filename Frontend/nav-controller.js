document.addEventListener('DOMContentLoaded', () => {
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

  // Active Link Highlighting
  const path = window.location.pathname.split('/').pop() || 'index.html';
  
  // Map page filenames to data-path identifiers
  const pathMap = {
    'index.html': 'home',
    'services.html': 'services',
    'how-it-works.html': 'how-it-works',
    'portfolio.html': 'portfolio',
    'design-studio.html': 'others',
    'blogs.html': 'others',
    'faqs.html': 'others',
    'book-a-call.html': 'book-a-call',
    'booking-details.html': 'book-a-call'
  };

  const activePath = pathMap[path] || 'home';

  // Highlight links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('data-path');
    if (linkPath === activePath) {
      link.classList.add('text-primary', 'font-bold', 'underline', 'decoration-tertiary', 'underline-offset-8');
      link.classList.remove('text-on-surface-variant', 'hover:text-on-surface');
    }
  });
});
