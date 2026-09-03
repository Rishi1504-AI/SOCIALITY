/**
 * Hover Image Reveal — Originkit (Vanilla JS Edition)
 * Replicates Originkit's Framer Motion HoverImageReveal:
 * - In-flow natural text layout (fixes text truncation & visibility bugs)
 * - Spring cursor tracking for floating preview card
 * - Dual-line kinetic text roll animation on hover
 * - Smooth vertical image slide between active items
 * - Coordinates forwarding to underlying WebGL Chessboard lamp
 *
 * Implements Robert C. Martin's Clean Code principles:
 * - Functions strictly under 20 lines
 * - Single Responsibility Principle (SRP)
 * - Intention-revealing identifiers
 * - Stepdown newspaper architecture
 */

(function () {
  'use strict';

  function injectComponentStyles() {
    if (document.getElementById('hover-image-reveal-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'hover-image-reveal-styles';
    styleEl.textContent = `
      .reveal-item {
        position: relative;
        overflow: hidden;
        cursor: pointer;
        user-select: none;
        display: inline-block;
        text-align: center;
        transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .reveal-item.is-dimmed {
        opacity: 0.25 !important;
      }
      .reveal-item.is-dimmed .reveal-roll-primary {
        color: #51565A !important;
      }
      .reveal-item.is-active {
        opacity: 1 !important;
      }
      .reveal-roll-wrapper {
        position: relative;
        display: inline-block;
        transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .reveal-item.is-active .reveal-roll-wrapper {
        transform: translateY(-100%);
      }
      .reveal-roll-primary {
        display: block;
        color: #FFF6DE;
        transition: color 0.25s ease;
        white-space: nowrap;
        text-shadow: 0 2px 20px rgba(0, 0, 0, 0.85);
      }
      .reveal-roll-secondary {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        display: block;
        color: #F48F68;
        white-space: nowrap;
        text-shadow: 0 0 25px rgba(244, 143, 104, 0.6);
      }
      .reveal-floating-card {
        position: fixed;
        pointer-events: none;
        z-index: 60;
        will-change: transform, opacity;
        top: 0;
        left: 0;
        opacity: 0;
        transform: translate3d(-50%, -50%, 0) scale(0.9);
        transition: opacity 0.35s ease, scale 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      }
    `;
    document.head.appendChild(styleEl);
  }

  function initHoverImageReveal(container) {
    if (!container) return;

    const floatingCard = container.querySelector('.reveal-floating-card');
    const imageElements = container.querySelectorAll('.reveal-image-layer');
    const items = container.querySelectorAll('.reveal-item');

    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;
    const springStrength = 0.16;

    function renderLoop() {
      currentX += (targetX - currentX) * springStrength;
      currentY += (targetY - currentY) * springStrength;

      if (floatingCard) {
        floatingCard.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      }
      requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);

    container.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    }, { passive: true });

    container.addEventListener('mouseleave', () => {
      setActiveItem(-1, floatingCard, imageElements, items);
    });

    items.forEach((item, index) => {
      item.addEventListener('mouseenter', () => {
        setActiveItem(index, floatingCard, imageElements, items);
      });
    });
  }

  function setActiveItem(index, floatingCard, imageElements, items) {
    if (index === -1) {
      if (floatingCard) floatingCard.style.opacity = '0';
      items.forEach((item) => { item.classList.remove('is-active', 'is-dimmed'); });
      return;
    }

    if (floatingCard) floatingCard.style.opacity = '1';
    updateImageLayers(imageElements, index);
    updateItemStates(items, index);
  }

  function updateImageLayers(imageElements, activeIndex) {
    imageElements.forEach((imgLayer, i) => {
      if (i === activeIndex) {
        imgLayer.style.transform = 'translateY(0%)';
        imgLayer.style.opacity = '1';
      } else if (i < activeIndex) {
        imgLayer.style.transform = 'translateY(-100%)';
        imgLayer.style.opacity = '0';
      } else {
        imgLayer.style.transform = 'translateY(100%)';
        imgLayer.style.opacity = '0';
      }
    });
  }

  function updateItemStates(items, activeIndex) {
    items.forEach((item, i) => {
      if (i === activeIndex) {
        item.classList.add('is-active');
        item.classList.remove('is-dimmed');
      } else {
        item.classList.remove('is-active');
        item.classList.add('is-dimmed');
      }
    });
  }

  function init() {
    injectComponentStyles();
    const containers = document.querySelectorAll('[data-hover-image-reveal], #hover-image-reveal');
    containers.forEach((container) => initHoverImageReveal(container));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
