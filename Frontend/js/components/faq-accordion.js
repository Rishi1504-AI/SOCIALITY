/**
 * Sociality AI - Accessible FAQ Accordion Component
 * Supports both CSS grid and max-height accordion animations with WCAG AA keyboard accessibility.
 *
 * Implements Robert C. Martin's Clean Code principles:
 * - Functions strictly under 20 lines
 * - Single Responsibility Principle (SRP)
 * - Intention-revealing identifiers
 * - Stepdown newspaper architecture
 */

(function () {
  'use strict';

  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach((item, index) => {
      setupAccordionItem(item, index, faqItems);
    });
  }

  function setupAccordionItem(item, index, allItems) {
    const header = item.querySelector('.faq-header');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.icon-expand');
    if (!header || !content) return;

    const contentId = content.id || `faq-content-${index + 1}`;
    content.id = contentId;

    setupItemAccessibility(header, content, contentId, item);

    header.addEventListener('click', () => {
      toggleAccordion(item, header, content, icon, allItems);
    });

    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleAccordion(item, header, content, icon, allItems);
      }
    });
  }

  function setupItemAccessibility(header, content, contentId, item) {
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-controls', contentId);

    const hasDataState = item.hasAttribute('data-state');
    const isInitialOpen = hasDataState
      ? item.getAttribute('data-state') === 'open'
      : (!content.classList.contains('hidden') && content.style.maxHeight !== '0px');

    header.setAttribute('aria-expanded', isInitialOpen ? 'true' : 'false');
  }

  function toggleAccordion(item, header, content, icon, allItems) {
    const hasDataState = item.hasAttribute('data-state');
    const isClosed = hasDataState
      ? item.getAttribute('data-state') === 'closed'
      : (content.classList.contains('hidden') || content.style.maxHeight === '0px' || !content.style.maxHeight);

    closeOtherAccordionItems(item, allItems);

    if (isClosed) {
      openAccordionItem(item, header, content, icon, hasDataState);
    } else {
      closeAccordionItem(item, header, content, icon, hasDataState);
    }
  }

  function closeOtherAccordionItems(currentItem, allItems) {
    allItems.forEach((other) => {
      if (other === currentItem) return;
      const oHeader = other.querySelector('.faq-header');
      const oContent = other.querySelector('.faq-content');
      const oIcon = other.querySelector('.icon-expand');
      const isOtherDark = other.classList.contains('bg-[#1c1a16]') || Boolean(other.closest('#faqs'));

      if (other.hasAttribute('data-state')) {
        other.setAttribute('data-state', 'closed');
        if (oContent) {
          oContent.style.gridTemplateRows = '0fr';
          oContent.style.opacity = '0';
        }
        if (!isOtherDark) {
          other.classList.remove('bg-primary-container');
          other.classList.add('bg-surface-container-low');
          const ans = other.querySelector('.faq-content p');
          if (ans) {
            ans.classList.remove('text-[#1c1b1a]');
            ans.classList.add('text-on-surface-variant');
          }
        }
      } else if (oContent) {
        oContent.style.maxHeight = '0px';
        oContent.classList.add('hidden');
      }

      if (oIcon) {
        oIcon.textContent = 'add';
        oIcon.style.transform = 'rotate(0deg)';
      }
      if (oHeader) {
        oHeader.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function openAccordionItem(item, header, content, icon, hasDataState) {
    const isDark = item.classList.contains('bg-[#1c1a16]') || Boolean(item.closest('#faqs'));

    if (hasDataState) {
      item.setAttribute('data-state', 'open');
      content.style.gridTemplateRows = '1fr';
      content.style.opacity = '1';
      if (!isDark) {
        item.classList.remove('bg-surface-container-low');
        item.classList.add('bg-primary-container');
        const ans = item.querySelector('.faq-content p');
        if (ans) {
          ans.classList.remove('text-on-surface-variant');
          ans.classList.add('text-[#1c1b1a]');
        }
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
  }

  function closeAccordionItem(item, header, content, icon, hasDataState) {
    const isDark = item.classList.contains('bg-[#1c1a16]') || Boolean(item.closest('#faqs'));

    if (hasDataState) {
      item.setAttribute('data-state', 'closed');
      content.style.gridTemplateRows = '0fr';
      content.style.opacity = '0';
      if (!isDark) {
        item.classList.remove('bg-primary-container');
        item.classList.add('bg-surface-container-low');
        const ans = item.querySelector('.faq-content p');
        if (ans) {
          ans.classList.remove('text-[#1c1b1a]');
          ans.classList.add('text-on-surface-variant');
        }
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaqAccordion);
  } else {
    initFaqAccordion();
  }
})();
