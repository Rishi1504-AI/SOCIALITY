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

  // 1. Physics & Interaction Defaults
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

  // 2. High-Level Initialization
  function initEmojiBurst() {
    document.addEventListener('click', handleGlobalClick, true);
  }

  // 3. Target Detection
  function findBookCallTarget(eventTarget) {
    if (!eventTarget || !eventTarget.closest) return null;
    return eventTarget.closest('a[href*="book-a-call"], button[onclick*="book-a-call"]');
  }

  function isEligibleRedirect(linkElement) {
    if (!linkElement) return false;
    const href = linkElement.getAttribute('href') || '';
    const isAlreadyOnBooking = window.location.pathname.endsWith('book-a-call.html');
    return /book-a-call(\.html)?/i.test(href) && !isAlreadyOnBooking;
  }

  // 4. Click & Navigation Orchestration
  function handleGlobalClick(event) {
    const bookCallBtn = findBookCallTarget(event.target);
    if (!bookCallBtn) return;

    triggerBurst(bookCallBtn);

    if (shouldDeferNavigation(event, bookCallBtn)) {
      event.preventDefault();
      const destination = bookCallBtn.getAttribute('href');
      setTimeout(() => navigateToDestination(destination), BURST_CONFIG.redirectDelayMs);
    }
  }

  function shouldDeferNavigation(event, element) {
    const hasModifierKey = event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0;
    return isEligibleRedirect(element) && !hasModifierKey;
  }

  function navigateToDestination(destinationUrl) {
    if (destinationUrl) {
      window.location.href = destinationUrl;
    }
  }

  // 5. Burst Orchestration
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

  // 6. Tactile Haptic Nudge Animation
  function applyHapticNudge(buttonElement) {
    if (!buttonElement || typeof buttonElement.animate !== 'function') return;
    const s = BURST_CONFIG.shakeIntensity;
    const keyframes = [
      { transform: 'translate(0px, 0px) rotate(0deg)' },
      { transform: `translate(${s}px, ${-s * 0.6}px) rotate(-2.5deg)` },
      { transform: `translate(${-s}px, ${s * 0.3}px) rotate(2.5deg)` },
      { transform: `translate(${s * 0.5}px, 0px) rotate(-1deg)` },
      { transform: 'translate(0px, 0px) rotate(0deg)' }
    ];
    buttonElement.animate(keyframes, {
      duration: 260,
      easing: 'cubic-bezier(.36,.07,.19,.97)'
    });
  }

  function triggerDeviceVibration() {
    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(25);
    }
  }

  // 7. Particle Factory & Management
  function getOverlayLayer() {
    if (!overlayLayer || !document.body.contains(overlayLayer)) {
      overlayLayer = document.createElement('div');
      overlayLayer.id = 'emoji-burst-overlay';
      overlayLayer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:999999;overflow:hidden;';
      overlayLayer.setAttribute('aria-hidden', 'true');
      document.body.appendChild(overlayLayer);
    }
    return overlayLayer;
  }

  function spawnBurstParticles(originX, originY) {
    const layer = getOverlayLayer();
    const count = BURST_CONFIG.burstCount;
    for (let i = 0; i < count; i++) {
      if (activeParticles.length >= BURST_CONFIG.maxActiveParticles) break;
      activeParticles.push(createParticle(originX, originY, layer));
    }
    startAnimationLoop();
  }

  function createParticle(originX, originY, layer) {
    const size = BURST_CONFIG.emojiSize;
    const el = createParticleElement(size, layer);
    const speed = BURST_CONFIG.power * (0.65 + Math.random() * 0.8);
    const angle = ((-90 + (Math.random() * 2 - 1) * BURST_CONFIG.spread) * Math.PI) / 180;

    return {
      el,
      x: originX - size / 2,
      y: originY - size / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * 360,
      vrot: (Math.random() * 2 - 1) * 14,
      size,
      life: 260
    };
  }

  function createParticleElement(size, layer) {
    const el = document.createElement('span');
    const pool = BURST_CONFIG.emojis;
    el.textContent = pool[(Math.random() * pool.length) | 0];
    el.style.cssText = `position:fixed;left:0;top:0;font-size:${size}px;line-height:1;will-change:transform,opacity;pointer-events:none;user-select:none;`;
    el.setAttribute('aria-hidden', 'true');
    layer.appendChild(el);
    return el;
  }

  // 8. Physics Animation Loop
  function startAnimationLoop() {
    if (!animationFrameId) {
      lastTimestamp = 0;
      animationFrameId = requestAnimationFrame(stepPhysicsAnimation);
    }
  }

  function stepPhysicsAnimation(timestamp) {
    let dt = lastTimestamp ? (timestamp - lastTimestamp) / 16.6667 : 1;
    lastTimestamp = timestamp;
    if (dt > 3) dt = 3;

    updateAllParticles(dt);

    if (activeParticles.length > 0) {
      animationFrameId = requestAnimationFrame(stepPhysicsAnimation);
    } else {
      animationFrameId = 0;
      lastTimestamp = 0;
    }
  }

  function updateAllParticles(dt) {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const gravity = BURST_CONFIG.gravity;

    for (let i = activeParticles.length - 1; i >= 0; i--) {
      const p = activeParticles[i];
      p.vy += gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vrot * dt;
      p.life -= dt;

      if (isParticleDead(p, screenW, screenH)) {
        p.el.remove();
        activeParticles.splice(i, 1);
      } else {
        renderParticle(p);
      }
    }
  }

  function isParticleDead(p, screenW, screenH) {
    return (
      p.life <= 0 ||
      p.y > screenH + p.size * 2.5 ||
      p.x < -p.size * 3 ||
      p.x > screenW + p.size * 3
    );
  }

  function renderParticle(p) {
    const fade = p.life < 22 ? Math.max(0, p.life / 22) : 1;
    p.el.style.opacity = String(fade);
    p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`;
  }

  // 9. Document Ready Execution
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmojiBurst);
  } else {
    initEmojiBurst();
  }
})();
