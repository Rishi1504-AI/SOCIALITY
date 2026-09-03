/**
 * Click Effects — Originkit (Sociality AI Edition)
 * High-contrast tactile click animation engine with GSAP.
 * Modes: 'sniper' (default), 'burst', 'particles', 'rings', 'crosshair', 'wavy'
 *
 * Implements Robert C. Martin's Clean Code principles:
 * - Functions strictly under 20 lines
 * - Single Responsibility Principle (SRP)
 * - Intention-revealing identifiers
 * - Stepdown newspaper architecture
 */

(function () {
  'use strict';

  const CONFIG = {
    interactionMode: 'sniper',
    duration: 0.35,
    strokeWidth: 2.5,
    effectSize: 85,
    rotation: 0,
    lightBgColor: '#984726',
    darkBgColor: '#F48F68'
  };

  window.MouseEffectsConfig = Object.assign(CONFIG, window.MouseEffectsConfig || {});
  let container = null;

  function initClickEffects() {
    document.addEventListener('pointerdown', handleGlobalClick);
  }

  function handleGlobalClick(e) {
    if (!window.gsap) return;
    const parent = ensureContainer();
    const mode = window.MouseEffectsConfig.interactionMode || 'sniper';
    const color = getActiveColor(e.target);
    const renderer = Effects[mode] || Effects.sniper;
    renderer(parent, e.clientX, e.clientY, color, window.MouseEffectsConfig);
  }

  function ensureContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'click-effects-container';
      container.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;overflow:hidden;z-index:999999;';
      document.body.appendChild(container);
    }
    return container;
  }

  function getActiveColor(target) {
    if (window.MouseEffectsConfig.overrideColor) {
      return window.MouseEffectsConfig.overrideColor;
    }
    return isDarkElement(target) ? CONFIG.darkBgColor : CONFIG.lightBgColor;
  }

  function isDarkElement(target) {
    let current = target;
    while (current && current !== document.body && current !== document.documentElement) {
      if (hasDarkClassOrTag(current)) return true;
      if (hasDarkComputedBg(current)) return true;
      current = current.parentElement;
    }
    return false;
  }

  function hasDarkClassOrTag(el) {
    if (!el.classList) return false;
    const isDarkTag = el.tagName === 'FOOTER' || el.id === 'faqs' || el.id === 'how-it-works' || el.id === 'capabilities-system';
    const hasDarkClass = el.classList.contains('bg-[#0d0c0a]') ||
      el.classList.contains('bg-[#1c1a16]') ||
      el.classList.contains('bg-[#080706]') ||
      el.classList.contains('bg-[#645e4c]') ||
      el.classList.contains('bg-black');
    return isDarkTag || hasDarkClass;
  }

  function hasDarkComputedBg(el) {
    const style = window.getComputedStyle(el);
    const bg = style.backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      const rgb = bg.match(/\d+/g);
      if (rgb && rgb.length >= 3) {
        const lum = (0.299 * parseInt(rgb[0], 10) + 0.587 * parseInt(rgb[1], 10) + 0.114 * parseInt(rgb[2], 10)) / 255;
        return lum < 0.55;
      }
    }
    return false;
  }

  function createSvg(x, y, effectSize, rotation) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${effectSize} ${effectSize}`);
    svg.setAttribute('width', effectSize);
    svg.setAttribute('height', effectSize);
    svg.style.cssText = `position:absolute;left:${x - effectSize / 2}px;top:${y - effectSize / 2}px;width:${effectSize}px;height:${effectSize}px;pointer-events:none;overflow:visible;transform:rotate(${rotation}deg);transform-origin:center;`;
    return svg;
  }

  // 4. Effect Modes
  const Effects = {
    sniper: renderSniperEffect,
    burst: renderBurstEffect,
    particles: renderParticlesEffect,
    rings: renderRingsEffect,
    crosshair: renderCrosshairEffect,
    wavy: renderWavyEffect
  };

  function renderSniperEffect(parent, x, y, color, cfg) {
    const wrapper = createWrapper(parent);
    const svg = createSvg(x, y, cfg.effectSize, cfg.rotation);
    wrapper.appendChild(svg);

    const center = cfg.effectSize / 2;
    const lineLength = cfg.effectSize * 0.2;
    [0, 90, 180, 270].forEach((deg) => {
      animateSniperRay(svg, center, lineLength, deg, color, cfg.strokeWidth, cfg.duration);
    });

    spawnSparkParticles(wrapper, x, y, color, cfg.duration);
    setTimeout(() => wrapper.remove(), (cfg.duration + 0.3) * 1000);
  }

  function animateSniperRay(svg, center, lineLength, deg, color, strokeWidth, duration) {
    const rad = deg * (Math.PI / 180);
    const startX = center + 5 * Math.cos(rad);
    const startY = center - 5 * Math.sin(rad);
    const endX = center + (5 + lineLength) * Math.cos(rad);
    const endY = center - (5 + lineLength) * Math.sin(rad);

    const line = createSvgLine(startX, startY, endX, endY, color, strokeWidth);
    svg.appendChild(line);

    window.gsap.timeline()
      .to(line, {
        attr: { x1: endX, y1: endY, x2: endX, y2: endY },
        translateX: (5 + lineLength) * Math.cos(rad),
        translateY: -(5 + lineLength) * Math.sin(rad),
        duration: duration,
        ease: 'power2.out'
      })
      .to(line, { opacity: 0, duration: 0.1 }, `-=${duration * 0.4}`);
  }

  function createSvgLine(x1, y1, x2, y2, color, strokeWidth) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', strokeWidth);
    line.setAttribute('stroke-linecap', 'square');
    return line;
  }

  function spawnSparkParticles(wrapper, x, y, color, duration) {
    for (let i = 0; i < 8; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:3px;height:3px;background-color:${color};border-radius:50%;pointer-events:none;`;
      wrapper.appendChild(dot);

      const angle = (i * 45 + 22.5) * (Math.PI / 180);
      const dist = 28 + Math.random() * 14;
      window.gsap.to(dot, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        scale: 0.2,
        duration: duration * 0.9,
        ease: 'power2.out'
      });
    }
  }

  function renderBurstEffect(parent, x, y, color, cfg) {
    const wrapper = createWrapper(parent);
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:4px;height:4px;background-color:${color};border-radius:50%;pointer-events:none;`;
      wrapper.appendChild(p);

      const angle = (i * 30) * (Math.PI / 180);
      const dist = cfg.effectSize * 0.4;
      window.gsap.to(p, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        scale: 0,
        duration: cfg.duration,
        ease: 'power3.out'
      });
    }
    setTimeout(() => wrapper.remove(), cfg.duration * 1000);
  }

  function renderParticlesEffect(parent, x, y, color, cfg) {
    renderBurstEffect(parent, x, y, color, cfg);
  }

  function renderRingsEffect(parent, x, y, color, cfg) {
    const wrapper = createWrapper(parent);
    const ring = document.createElement('div');
    ring.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:10px;height:10px;margin-left:-5px;margin-top:-5px;border:2px solid ${color};border-radius:50%;pointer-events:none;`;
    wrapper.appendChild(ring);

    window.gsap.to(ring, {
      width: cfg.effectSize,
      height: cfg.effectSize,
      marginLeft: -cfg.effectSize / 2,
      marginTop: -cfg.effectSize / 2,
      opacity: 0,
      duration: cfg.duration,
      ease: 'power2.out',
      onComplete: () => wrapper.remove()
    });
  }

  function renderCrosshairEffect(parent, x, y, color, cfg) {
    renderSniperEffect(parent, x, y, color, cfg);
  }

  function renderWavyEffect(parent, x, y, color, cfg) {
    renderRingsEffect(parent, x, y, color, cfg);
  }

  function createWrapper(parent) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:absolute;pointer-events:none;';
    parent.appendChild(wrapper);
    return wrapper;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClickEffects);
  } else {
    initClickEffects();
  }
})();
