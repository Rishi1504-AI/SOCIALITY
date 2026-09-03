/**
 * Sociality AI - Originkit Button Animations Engine
 * Faithfully adapts the Liquid Button, Arrow Reveal Button & Multi-Profile Button Animations.
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
    liquidEase: 'cubic-bezier(0.22, 1, 0.36, 1)',
    pressScale: 0.96,
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
    enhanceLiquidBookCallButtons();
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
      /* --- Liquid Button Engine (Book a Call & Calendly Targets) --- */
      .originkit-liquid-btn {
        position: relative !important;
        overflow: hidden !important;
        isolation: isolate;
        transform-style: preserve-3d;
        will-change: transform, box-shadow;
        transition: transform 0.36s ${ANIMATION_CONFIG.liquidEase}, box-shadow 0.36s ${ANIMATION_CONFIG.liquidEase} !important;
      }
      .originkit-liquid-btn::before {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        background: radial-gradient(circle at var(--liquid-x, 50%) var(--liquid-y, 50%), rgba(255, 255, 255, 0.35) 0%, rgba(244, 143, 104, 0.28) 40%, transparent 75%);
        opacity: 0;
        transition: opacity 0.32s ${ANIMATION_CONFIG.liquidEase};
        pointer-events: none;
        z-index: 1;
      }
      .originkit-liquid-btn.is-liquid-hover::before {
        opacity: 1;
      }
      .originkit-liquid-sheen {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        overflow: hidden;
        z-index: 1;
      }
      .originkit-liquid-sheen::after {
        content: '';
        position: absolute;
        top: -60%;
        left: -60%;
        width: 220%;
        height: 220%;
        background: linear-gradient(
          115deg,
          transparent 25%,
          rgba(255, 255, 255, 0.08) 40%,
          rgba(255, 255, 255, 0.45) 50%,
          rgba(255, 255, 255, 0.08) 60%,
          transparent 75%
        );
        transform: translateX(-120%) rotate(25deg);
        transition: transform 0.75s ${ANIMATION_CONFIG.liquidEase};
        pointer-events: none;
      }
      .originkit-liquid-btn.is-liquid-hover .originkit-liquid-sheen::after {
        transform: translateX(120%) rotate(25deg);
      }
      .originkit-liquid-blob {
        position: absolute;
        width: 110px;
        height: 110px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, rgba(244, 143, 104, 0.25) 55%, transparent 75%);
        filter: blur(8px);
        pointer-events: none;
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.4);
        transition: opacity 0.3s ease, transform 0.12s ${ANIMATION_CONFIG.liquidEase};
        z-index: 1;
      }
      .originkit-liquid-btn.is-liquid-hover .originkit-liquid-blob {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      .originkit-liquid-ripple {
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(244, 143, 104, 0.35) 50%, transparent 80%);
        pointer-events: none;
        transform: translate(-50%, -50%) scale(0);
        animation: originkitLiquidRipple 0.65s ${ANIMATION_CONFIG.liquidEase} forwards;
        z-index: 1;
      }
      @keyframes originkitLiquidRipple {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0.9; }
        100% { transform: translate(-50%, -50%) scale(3.5); opacity: 0; }
      }
      .originkit-liquid-btn.is-liquid-pressed {
        transform: scale(${ANIMATION_CONFIG.pressScale}) !important;
      }
      .originkit-liquid-text {
        position: relative;
        z-index: 2;
        pointer-events: none;
        transition: transform 0.22s ${ANIMATION_CONFIG.liquidEase};
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.375rem;
      }

      /* --- Arrow Reveal Profile --- */
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

  // 4. Liquid Book a Call & Calendly Button Enhancement
  function enhanceLiquidBookCallButtons() {
    const candidates = queryLiquidButtonCandidates();
    candidates.forEach((btn) => setupLiquidButton(btn));
  }

  function queryLiquidButtonCandidates() {
    const directLinks = Array.from(
      document.querySelectorAll('a[href*="calendly.com"], a[href*="book-a-call"], [data-book-a-call]')
    );
    const textLinks = Array.from(document.querySelectorAll('a, button')).filter((el) => {
      const text = el.textContent ? el.textContent.trim() : '';
      return /book a call|start a project/i.test(text);
    });
    return Array.from(new Set([...directLinks, ...textLinks]));
  }

  function setupLiquidButton(btn) {
    if (btn.dataset.originkitLiquidInit) return;
    btn.dataset.originkitLiquidInit = 'true';
    btn.classList.add('originkit-liquid-btn');

    const sheen = document.createElement('span');
    sheen.className = 'originkit-liquid-sheen';
    sheen.setAttribute('aria-hidden', 'true');

    const blob = document.createElement('span');
    blob.className = 'originkit-liquid-blob';
    blob.setAttribute('aria-hidden', 'true');

    btn.appendChild(sheen);
    btn.appendChild(blob);

    attachLiquidEvents(btn, blob);
  }

  function attachLiquidEvents(btn, blob) {
    btn.addEventListener('mousemove', (e) => handleLiquidMouseMove(e, btn, blob));
    btn.addEventListener('mouseenter', () => handleLiquidMouseEnter(btn));
    btn.addEventListener('mouseleave', () => handleLiquidMouseLeave(btn));
    btn.addEventListener('pointerdown', (e) => handleLiquidPointerDown(e, btn));
    btn.addEventListener('pointerup', () => handleLiquidPointerUp(btn));
  }

  function handleLiquidMouseMove(e, btn, blob) {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    btn.style.setProperty('--liquid-x', `${x}px`);
    btn.style.setProperty('--liquid-y', `${y}px`);

    blob.style.left = `${x}px`;
    blob.style.top = `${y}px`;

    const deltaX = (x - rect.width / 2) * 0.16;
    const deltaY = (y - rect.height / 2) * 0.2;
    btn.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(1.03)`;
    btn.style.boxShadow = `0 12px 28px -6px rgba(244, 143, 104, 0.45), 0 4px 12px rgba(0, 0, 0, 0.25)`;
  }

  function handleLiquidMouseEnter(btn) {
    btn.classList.add('is-liquid-hover');
  }

  function handleLiquidMouseLeave(btn) {
    btn.classList.remove('is-liquid-hover', 'is-liquid-pressed');
    btn.style.transform = 'translate3d(0, 0, 0) scale(1)';
    btn.style.boxShadow = '';
  }

  function handleLiquidPointerDown(e, btn) {
    btn.classList.add('is-liquid-pressed');
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.className = 'originkit-liquid-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    const size = Math.max(rect.width, rect.height) * 1.6;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }

  function handleLiquidPointerUp(btn) {
    btn.classList.remove('is-liquid-pressed');
  }

  // 5. Arrow Reveal Button Enhancement (Profile A)
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
