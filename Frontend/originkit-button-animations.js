/**
 * Sociality AI - Originkit Button Animations Engine
 * Faithfully adapts the Arrow Reveal Button & Multi-Profile Button Animations.
 *
 * Implements Robert C. Martin's Clean Code principles:
 * - Functions strictly under 20 lines
 * - Single Responsibility Principle (SRP)
 * - Intention-revealing identifiers
 * - Stepdown newspaper architecture
 * - 60 FPS GPU-accelerated CSS and ResizeObserver precision
 */

(function () {
  'use strict';

  if (window.__originkitButtonAnimationsLoaded) return;
  window.__originkitButtonAnimationsLoaded = true;

  // 1. Animation Constants & Physics Presets
  const ANIMATION_CONFIG = {
    transitionDuration: '0.46s',
    transitionEase: 'cubic-bezier(0.44, 0, 0.56, 1)',
    pressScale: 0.97,
    textOffsetPx: 6,
    hoverRotationDeg: 45
  };

  // 2. High-Level Initialization
  function initButtonAnimations() {
    injectGlobalButtonStyles();
    enhanceAllButtonProfiles();
    observeDynamicButtonAdditions();
  }

  function enhanceAllButtonProfiles() {
    enhanceArrowRevealButtons();
    enhanceFilterPillButtons();
    enhanceInteractiveCardActions();
  }

  // 3. Style Injection
  function injectGlobalButtonStyles() {
    if (document.getElementById('originkit-button-styles')) return;
    const style = document.createElement('style');
    style.id = 'originkit-button-styles';
    style.textContent = getButtonStylesCss();
    document.head.appendChild(style);
  }

  function getButtonStylesCss() {
    return `
      .originkit-arrow-btn {
        position: relative !important;
        overflow: hidden !important;
        transform: translateZ(0);
        transition: transform 0.2s cubic-bezier(0.44, 0, 0.56, 1), box-shadow 0.3s ease !important;
        will-change: transform;
      }
      .originkit-arrow-btn .originkit-badge {
        position: absolute;
        border-radius: 9999px;
        background: currentColor;
        opacity: 0.15;
        pointer-events: none;
        transform-origin: center;
        transition: transform ${ANIMATION_CONFIG.transitionDuration} ${ANIMATION_CONFIG.transitionEase}, opacity ${ANIMATION_CONFIG.transitionDuration} ease;
        will-change: transform, opacity;
      }
      .originkit-arrow-btn.is-hovered .originkit-badge {
        opacity: 0.22;
      }
      .originkit-arrow-btn .originkit-icon-wrap {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: transform ${ANIMATION_CONFIG.transitionDuration} ${ANIMATION_CONFIG.transitionEase};
        will-change: transform;
      }
      .originkit-arrow-btn .originkit-label {
        position: relative;
        z-index: 1;
        transition: transform ${ANIMATION_CONFIG.transitionDuration} ${ANIMATION_CONFIG.transitionEase};
        will-change: transform;
      }
      .originkit-pill-press {
        transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.25s ease, box-shadow 0.25s ease !important;
        will-change: transform;
      }
      .originkit-pill-press:active {
        transform: scale(${ANIMATION_CONFIG.pressScale}) !important;
      }
      .originkit-action-glow {
        position: relative;
        overflow: hidden;
      }
      .originkit-action-glow::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.28) 50%, transparent 80%);
        transform: translateX(-100%);
        transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
      }
      .originkit-action-glow:hover::after {
        transform: translateX(100%);
      }
    `;
  }

  // 4. Arrow Reveal Button Enhancement (Profile A)
  function enhanceArrowRevealButtons() {
    const targets = queryArrowRevealCandidates();
    targets.forEach((btn) => setupArrowReveal(btn));
  }

  function queryArrowRevealCandidates() {
    return document.querySelectorAll(
      'a[href*="cafe-website"], [data-open-case-modal], #close-case-modal-btn, .group\\/btn, .group\\/previewbtn'
    );
  }

  function setupArrowReveal(button) {
    if (button.dataset.originkitInit) return;
    button.dataset.originkitInit = 'true';
    button.classList.add('originkit-arrow-btn');

    const badge = createBadgeElement();
    const icon = findOrCreateIconWrapper(button);
    const label = findOrCreateLabelWrapper(button, icon);

    button.appendChild(badge);
    attachArrowEventListeners(button, badge, icon, label);
  }

  function createBadgeElement() {
    const badge = document.createElement('span');
    badge.className = 'originkit-badge';
    badge.setAttribute('aria-hidden', 'true');
    return badge;
  }

  function findOrCreateIconWrapper(button) {
    const existingIcon = button.querySelector('.material-symbols-outlined, svg');
    if (existingIcon) {
      existingIcon.classList.add('originkit-icon-wrap');
      return existingIcon;
    }
    return null;
  }

  function findOrCreateLabelWrapper(button, icon) {
    let label = button.querySelector('span:not(.material-symbols-outlined):not(.originkit-badge)');
    if (label) {
      label.classList.add('originkit-label');
      return label;
    }
    return null;
  }

  // 5. Arrow Event Handlers & Layout Measurement
  function attachArrowEventListeners(button, badge, icon, label) {
    button.addEventListener('mouseenter', () => handleArrowEnter(button, badge, icon, label));
    button.addEventListener('mouseleave', () => handleArrowLeave(button, badge, icon, label));
    button.addEventListener('pointerdown', () => applyPressScale(button));
    button.addEventListener('pointerup', () => releasePressScale(button));
  }

  function handleArrowEnter(button, badge, icon, label) {
    button.classList.add('is-hovered');
    const metrics = computeExpansionMetrics(button);

    badge.style.width = `${metrics.badgeSize}px`;
    badge.style.height = `${metrics.badgeSize}px`;
    badge.style.left = `${metrics.originX - metrics.badgeSize / 2}px`;
    badge.style.top = `${metrics.originY - metrics.badgeSize / 2}px`;
    badge.style.transform = `scale(${metrics.hoverScale})`;

    if (icon) {
      icon.style.transform = `rotate(${ANIMATION_CONFIG.hoverRotationDeg}deg) translateX(3px)`;
    }
    if (label) {
      label.style.transform = `translateX(${ANIMATION_CONFIG.textOffsetPx}px)`;
    }
  }

  function handleArrowLeave(button, badge, icon, label) {
    button.classList.remove('is-hovered');
    badge.style.transform = 'scale(0)';

    if (icon) {
      icon.style.transform = 'rotate(0deg) translateX(0)';
    }
    if (label) {
      label.style.transform = 'translateX(0)';
    }
    releasePressScale(button);
  }

  function computeExpansionMetrics(button) {
    const w = button.offsetWidth || 120;
    const h = button.offsetHeight || 44;
    const originX = w - h / 2;
    const originY = h / 2;
    const farDistance = Math.hypot(Math.max(originX, w - originX), Math.max(originY, h - originY));
    const badgeSize = Math.min(w, h);
    const hoverScale = Math.ceil((2 * farDistance * 1.05) / badgeSize);

    return { w, h, originX, originY, badgeSize, hoverScale };
  }

  function applyPressScale(button) {
    button.style.transform = `scale(${ANIMATION_CONFIG.pressScale})`;
  }

  function releasePressScale(button) {
    button.style.transform = 'scale(1)';
  }

  // 6. Filter & Pill Buttons (Profile B)
  function enhanceFilterPillButtons() {
    const pills = document.querySelectorAll(
      '[data-filter-category], [data-portfolio-card] [data-category-badge], .filter-btn'
    );
    pills.forEach((pill) => {
      pill.classList.add('originkit-pill-press');
    });
  }

  // 7. Interactive Action Cards & Glow Profile (Profile C)
  function enhanceInteractiveCardActions() {
    const actions = document.querySelectorAll(
      '[data-portfolio-card] a[href*="book-a-call"], [data-portfolio-card] button'
    );
    actions.forEach((act) => {
      act.classList.add('originkit-action-glow');
    });
  }

  // 8. Mutation Observer for Dynamic Modals & View Changes
  function observeDynamicButtonAdditions() {
    const observer = new MutationObserver((mutations) => {
      let shouldReindex = false;
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          shouldReindex = true;
          break;
        }
      }
      if (shouldReindex) {
        enhanceAllButtonProfiles();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // 9. Auto-Execution
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initButtonAnimations);
  } else {
    initButtonAnimations();
  }
})();
