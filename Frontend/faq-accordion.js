/**
 * Sociality AI - Accessible FAQ Accordion Component
 * Supports both CSS grid and max-height accordion animations with WCAG AA keyboard accessibility.
 */
(function () {
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach((item, index) => {
      const header = item.querySelector('.faq-header');
      const content = item.querySelector('.faq-content');
      const icon = item.querySelector('.icon-expand');

      if (!header || !content) return;

      const contentId = content.id || `faq-content-${index + 1}`;
      content.id = contentId;

      // Accessibility attributes
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.setAttribute('aria-controls', contentId);

      const hasDataState = item.hasAttribute('data-state');
      const isInitialOpen = hasDataState
        ? item.getAttribute('data-state') === 'open'
        : (!content.classList.contains('hidden') && content.style.maxHeight !== '0px');

      header.setAttribute('aria-expanded', isInitialOpen ? 'true' : 'false');

      function toggleAccordion() {
        const isClosed = hasDataState
          ? item.getAttribute('data-state') === 'closed'
          : (content.classList.contains('hidden') || content.style.maxHeight === '0px' || !content.style.maxHeight);

        // Close other items (accordion behavior)
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            const otherHeader = otherItem.querySelector('.faq-header');
            const otherContent = otherItem.querySelector('.faq-content');
            const otherIcon = otherItem.querySelector('.icon-expand');

            if (otherItem.hasAttribute('data-state')) {
              otherItem.setAttribute('data-state', 'closed');
              if (otherContent) {
                otherContent.style.gridTemplateRows = '0fr';
                otherContent.style.opacity = '0';
              }
              otherItem.classList.remove('bg-primary-container');
              otherItem.classList.add('bg-surface-container-low');
              const ans = otherItem.querySelector('.faq-content p');
              if (ans) {
                ans.classList.remove('text-[#1c1b1a]');
                ans.classList.add('text-on-surface-variant');
              }
            } else {
              if (otherContent) {
                otherContent.style.maxHeight = '0px';
                otherContent.classList.add('hidden');
              }
            }

            if (otherIcon) {
              otherIcon.textContent = 'add';
              otherIcon.style.transform = 'rotate(0deg)';
            }
            if (otherHeader) {
              otherHeader.setAttribute('aria-expanded', 'false');
            }
          }
        });

        // Toggle current item
        if (isClosed) {
          if (hasDataState) {
            item.setAttribute('data-state', 'open');
            content.style.gridTemplateRows = '1fr';
            content.style.opacity = '1';
            item.classList.remove('bg-surface-container-low');
            item.classList.add('bg-primary-container');
            const ans = item.querySelector('.faq-content p');
            if (ans) {
              ans.classList.remove('text-on-surface-variant');
              ans.classList.add('text-[#1c1b1a]');
            }
          } else {
            content.classList.remove('hidden');
            content.style.maxHeight = content.scrollHeight + 'px';
          }

          if (icon) {
            icon.textContent = 'remove';
            icon.style.transform = 'rotate(180deg)';
          }
          header.setAttribute('aria-expanded', 'true');
        } else {
          if (hasDataState) {
            item.setAttribute('data-state', 'closed');
            content.style.gridTemplateRows = '0fr';
            content.style.opacity = '0';
            item.classList.remove('bg-primary-container');
            item.classList.add('bg-surface-container-low');
            const ans = item.querySelector('.faq-content p');
            if (ans) {
              ans.classList.remove('text-[#1c1b1a]');
              ans.classList.add('text-on-surface-variant');
            }
          } else {
            content.style.maxHeight = '0px';
            content.classList.add('hidden');
          }

          if (icon) {
            icon.textContent = 'add';
            icon.style.transform = 'rotate(0deg)';
          }
          header.setAttribute('aria-expanded', 'false');
        }
      }

      header.addEventListener('click', toggleAccordion);

      // Keyboard accessibility: Enter & Space trigger toggle
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleAccordion();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaqAccordion);
  } else {
    initFaqAccordion();
  }
})();
