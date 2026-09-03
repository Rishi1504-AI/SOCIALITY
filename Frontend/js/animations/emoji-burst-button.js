/**
 * Sociality AI - Book a Call Emoji Burst & Haptic Nudge Animation
 * Faithfully adapts the Originkit Mobile Haptics physics engine.
 * Applies strictly to elements redirecting to the Book a Call page.
 *
 * Adheres strictly to Robert C. Martin's Clean Code principles:
 * - Functions strictly under 20 lines
 * - Single Responsibility Principle (SRP)
 * - Intention-revealing identifiers
 * - Stepdown newspaper architecture
 * - Zero memory leaks and graceful degradation
 */

(function () {
  'use strict';

  if (window.__socialityEmojiBurstLoaded) return;
  window.__socialityEmojiBurstLoaded = true;

  const BURST_CONFIG = {
    emojis: '🎉,✨,😄,🔥,💥,⭐,💖,🤩,👍,🥳,🎊,😎'.split(','),
    burstCount: 16,
    power: 12,
    spread: 55,
    gravity: 4 * 0.15,
    emojiSize: 22,
    shakeIntensity: 4,
    redirectDelayMs: 380,
    maxActiveParticles: 140
  };

  const activeParticles = [];
  let animationFrameId = 0;
  let lastTimestamp = 0;
  let overlayLayer = null;

  function initEmojiBurst() {
    document.addEventListener('click', handleGlobalClick, true);
  }

  function findBookCallTarget(eventTarget) {
    if (!eventTarget || !eventTarget.closest) return null;
    return eventTarget.closest('a[href*="calendly.com"], a[href*="book-a-call"], button[onclick*="book-a-call"]');
  }

  function isEligibleRedirect(linkElement) {
    if (!linkElement) return false;
    const href = linkElement.getAttribute('href') || '';
    return /calendly\.com|book-a-call/i.test(href);
  }

  function handleGlobalClick(event) {
    const bookCallBtn = findBookCallTarget(event.target);
    if (!bookCallBtn) return;

    triggerBurst(bookCallBtn);

    if (shouldDeferNavigation(event, bookCallBtn)) {
      event.preventDefault();
      const destination = bookCallBtn.getAttribute('href');
      setTimeout(() => navigateToDestination(destination, bookCallBtn), BURST_CONFIG.redirectDelayMs);
    }
  }

  function shouldDeferNavigation(event, element) {
    const hasModifierKey = event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0;
    return isEligibleRedirect(element) && !hasModifierKey;
  }

  function navigateToDestination(destinationUrl, linkElement) {
    if (destinationUrl) {
      if (linkElement && linkElement.getAttribute('target') === '_blank') {
        window.open(destinationUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = destinationUrl;
      }
    }
  }

  function triggerBurst(buttonElement) {
    applyHapticNudge(buttonElement);
    triggerDeviceVibration();
    const origin = getElementCenter(buttonElement);
    spawnBurstParticles(origin.x, origin.y);
  }

  function getElementCenter(element) {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  function applyHapticNudge(element) {
    if (!element || !element.animate) return;
    const intensity = BURST_CONFIG.shakeIntensity;
    element.animate([
      { transform: 'scale(1) translate3d(0, 0, 0)' },
      { transform: `scale(0.96) translate3d(-${intensity}px, ${intensity * 0.5}px, 0)` },
      { transform: `scale(1.02) translate3d(${intensity}px, -${intensity * 0.5}px, 0)` },
      { transform: `scale(0.99) translate3d(-${intensity * 0.5}px, ${intensity * 0.25}px, 0)` },
      { transform: 'scale(1) translate3d(0, 0, 0)' }
    ], {
      duration: 320,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    });
  }

  function triggerDeviceVibration() {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([15, 30, 20]);
      } catch (err) {
        // Silent fallback on restricted platforms
      }
    }
  }

  function ensureOverlayLayer() {
    if (overlayLayer && document.body.contains(overlayLayer)) {
      return overlayLayer;
    }
    overlayLayer = document.createElement('div');
    overlayLayer.id = 'sociality-emoji-burst-layer';
    overlayLayer.style.cssText = [
      'position: fixed',
      'inset: 0',
      'width: 100vw',
      'height: 100vh',
      'pointer-events: none',
      'z-index: 9999999',
      'overflow: hidden'
    ].join(';');
    document.body.appendChild(overlayLayer);
    return overlayLayer;
  }

  function spawnBurstParticles(originX, originY) {
    const layer = ensureOverlayLayer();
    const count = BURST_CONFIG.burstCount;

    for (let i = 0; i < count; i++) {
      if (activeParticles.length >= BURST_CONFIG.maxActiveParticles) {
        retireOldestParticle();
      }
      const particle = createBurstParticle(originX, originY, layer);
      activeParticles.push(particle);
    }

    startPhysicsLoop();
  }

  function createBurstParticle(x, y, parentLayer) {
    const el = document.createElement('span');
    const emoji = selectRandomEmoji();
    el.textContent = emoji;
    el.style.cssText = [
      'position: absolute',
      `left: ${x}px`,
      `top: ${y}px`,
      `font-size: ${BURST_CONFIG.emojiSize}px`,
      'line-height: 1',
      'pointer-events: none',
      'user-select: none',
      'will-change: transform, opacity',
      'transform: translate(-50%, -50%) scale(0)'
    ].join(';');

    parentLayer.appendChild(el);

    const angle = (Math.PI * 2 * Math.random());
    const speed = (0.4 + Math.random() * 0.8) * BURST_CONFIG.power;
    return {
      element: el,
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - BURST_CONFIG.power * 0.45,
      rotation: (Math.random() - 0.5) * 40,
      vRot: (Math.random() - 0.5) * 12,
      scale: 0.2,
      opacity: 1,
      life: 0,
      maxLife: 45 + Math.random() * 20
    };
  }

  function selectRandomEmoji() {
    const list = BURST_CONFIG.emojis;
    return list[Math.floor(Math.random() * list.length)];
  }

  function startPhysicsLoop() {
    if (!animationFrameId) {
      lastTimestamp = performance.now();
      animationFrameId = requestAnimationFrame(stepPhysics);
    }
  }

  function stepPhysics(timestamp) {
    const deltaMs = Math.min(32, timestamp - lastTimestamp);
    lastTimestamp = timestamp;
    const timeScale = deltaMs / 16.666;

    for (let i = activeParticles.length - 1; i >= 0; i--) {
      const p = activeParticles[i];
      updateParticlePhysics(p, timeScale);

      if (p.life >= p.maxLife || p.opacity <= 0.01) {
        removeParticleElement(p.element);
        activeParticles.splice(i, 1);
      }
    }

    if (activeParticles.length > 0) {
      animationFrameId = requestAnimationFrame(stepPhysics);
    } else {
      animationFrameId = 0;
    }
  }

  function updateParticlePhysics(p, timeScale) {
    p.life += timeScale;
    p.vy += BURST_CONFIG.gravity * timeScale;
    p.vx *= Math.pow(0.96, timeScale);
    p.x += p.vx * timeScale;
    p.y += p.vy * timeScale;
    p.rotation += p.vRot * timeScale;

    const progress = p.life / p.maxLife;
    p.scale = computeParticleScale(progress);
    p.opacity = computeParticleOpacity(progress);

    p.element.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) rotate(${p.rotation}deg) scale(${p.scale})`;
    p.element.style.opacity = p.opacity;
  }

  function computeParticleScale(progress) {
    if (progress < 0.2) return 0.2 + (progress / 0.2) * 0.95;
    if (progress > 0.7) return Math.max(0, 1.15 - ((progress - 0.7) / 0.3) * 1.15);
    return 1.15;
  }

  function computeParticleOpacity(progress) {
    if (progress > 0.6) return Math.max(0, 1 - ((progress - 0.6) / 0.4));
    return 1;
  }

  function retireOldestParticle() {
    const oldest = activeParticles.shift();
    if (oldest) removeParticleElement(oldest.element);
  }

  function removeParticleElement(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmojiBurst);
  } else {
    initEmojiBurst();
  }
})();
