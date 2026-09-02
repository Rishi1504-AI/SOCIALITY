/**
 * Click Effects — Originkit (Sociality AI Edition)
 * High-contrast tactile click animation engine with GSAP.
 * Modes: 'sniper' (default), 'burst', 'particles', 'rings', 'crosshair', 'wavy'
 */

(function () {
  'use strict';

  // Global Configuration
  const CONFIG = {
    interactionMode: 'sniper', // 'sniper' | 'burst' | 'particles' | 'rings' | 'crosshair' | 'wavy'
    duration: 0.35,
    strokeWidth: 2.5,
    effectSize: 85,
    rotation: 0,
    lightBgColor: '#984726', // Deep crisp terracotta for high-contrast on cream/white
    darkBgColor: '#F48F68',  // Luminous vibrant coral for dark obsidian/charcoal sections
  };

  // Expose configuration for runtime tweaks
  window.MouseEffectsConfig = Object.assign(CONFIG, window.MouseEffectsConfig || {});

  let container = null;

  function ensureContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'click-effects-container';
      container.style.cssText = [
        'position: fixed',
        'inset: 0',
        'width: 100vw',
        'height: 100vh',
        'pointer-events: none',
        'overflow: hidden',
        'z-index: 999999'
      ].join(';');
      document.body.appendChild(container);
    }
    return container;
  }

  function getActiveColor(target) {
    if (window.MouseEffectsConfig.overrideColor) {
      return window.MouseEffectsConfig.overrideColor;
    }

    // Determine contrast based on background of clicked element
    let current = target;
    let isDark = false;

    while (current && current !== document.body && current !== document.documentElement) {
      if (current.classList) {
        if (
          current.classList.contains('bg-[#0d0c0a]') ||
          current.classList.contains('bg-[#1c1a16]') ||
          current.classList.contains('bg-[#080706]') ||
          current.classList.contains('bg-[#645e4c]') ||
          current.classList.contains('bg-black') ||
          current.tagName === 'FOOTER' ||
          current.id === 'faqs' ||
          current.id === 'how-it-works'
        ) {
          isDark = true;
          break;
        }
      }

      const style = window.getComputedStyle(current);
      const bg = style.backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        const rgb = bg.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
          // Standard luminance formula
          const lum = (0.299 * parseInt(rgb[0], 10) + 0.587 * parseInt(rgb[1], 10) + 0.114 * parseInt(rgb[2], 10)) / 255;
          isDark = lum < 0.55;
          break;
        }
      }
      current = current.parentElement;
    }

    return isDark ? CONFIG.darkBgColor : CONFIG.lightBgColor;
  }

  function createSvg(x, y, effectSize, rotation) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${effectSize} ${effectSize}`);
    svg.setAttribute('width', effectSize);
    svg.setAttribute('height', effectSize);
    svg.style.cssText = [
      'position: absolute',
      `left: ${x - effectSize / 2}px`,
      `top: ${y - effectSize / 2}px`,
      `width: ${effectSize}px`,
      `height: ${effectSize}px`,
      'pointer-events: none',
      'overflow: visible',
      `transform: rotate(${rotation}deg)`,
      'transform-origin: center'
    ].join(';');
    return svg;
  }

  // Effect Renderers
  const Effects = {
    // 1. SNIPER (Default) - 4-direction crosshairs + 8 orbital sparkler particles
    sniper: function (parent, x, y, color, cfg) {
      const effectSize = cfg.effectSize;
      const strokeWidth = cfg.strokeWidth;
      const duration = cfg.duration;
      const rotation = cfg.rotation;

      const groupWrapper = document.createElement('div');
      groupWrapper.style.cssText = 'position: absolute; pointer-events: none;';
      parent.appendChild(groupWrapper);

      const svg = createSvg(x, y, effectSize, rotation);
      groupWrapper.appendChild(svg);

      const centerX = effectSize / 2;
      const centerY = effectSize / 2;
      const lineLength = effectSize * 0.2;
      const angles = [0, 90, 180, 270];

      angles.forEach(deg => {
        const rad = deg * (Math.PI / 180);
        const startX = centerX + 5 * Math.cos(rad);
        const startY = centerY - 5 * Math.sin(rad);
        const endX = centerX + (5 + lineLength) * Math.cos(rad);
        const endY = centerY - (5 + lineLength) * Math.sin(rad);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', startX);
        line.setAttribute('y1', startY);
        line.setAttribute('x2', endX);
        line.setAttribute('y2', endY);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', strokeWidth);
        line.setAttribute('stroke-linecap', 'square');
        svg.appendChild(line);

        window.gsap.timeline()
          .to(line, {
            attr: { x1: endX, y1: endY, x2: endX, y2: endY },
            translateX: (5 + lineLength) * Math.cos(rad),
            translateY: -(5 + lineLength) * Math.sin(rad),
            duration: duration,
            ease: 'power2.out'
          })
          .to(line, {
            attr: { 'stroke-width': 0 },
            duration: duration * 0.4,
            ease: 'linear'
          }, duration * 0.6);
      });

      // 8 orbital sparkler particles
      const particleAngles = [
        Math.PI / 3,
        (2 * Math.PI) / 3,
        (4 * Math.PI) / 3,
        (5 * Math.PI) / 3,
        Math.PI / 6,
        (5 * Math.PI) / 6,
        (7 * Math.PI) / 6,
        (11 * Math.PI) / 6
      ];

      particleAngles.forEach(rad => {
        const dot = document.createElement('div');
        dot.style.cssText = [
          'position: absolute',
          `left: ${x - strokeWidth / 2}px`,
          `top: ${y - strokeWidth / 2}px`,
          `width: ${strokeWidth}px`,
          `height: ${strokeWidth}px`,
          `background-color: ${color}`,
          'border-radius: 50%',
          'pointer-events: none',
          'transform-origin: center',
          `transform: rotate(${rotation}deg)`
        ].join(';');
        groupWrapper.appendChild(dot);

        window.gsap.set(dot, { x: 0, y: 0, width: strokeWidth, height: strokeWidth });
        window.gsap.timeline()
          .to(dot, {
            x: Math.cos(rad) * (effectSize * 0.4),
            y: Math.sin(rad) * (effectSize * 0.4),
            duration: duration,
            ease: 'power2.out'
          })
          .to(dot, {
            width: 0,
            height: 0,
            duration: duration * 0.4,
            ease: 'linear'
          }, duration * 0.6);
      });

      setTimeout(() => {
        if (groupWrapper.parentNode) groupWrapper.parentNode.removeChild(groupWrapper);
      }, (duration + 0.1) * 1000);
    },

    // 2. BURST - 4 angled burst lines
    burst: function (parent, x, y, color, cfg) {
      const { effectSize, strokeWidth, duration, rotation } = cfg;
      const svg = createSvg(x, y, effectSize, rotation);
      parent.appendChild(svg);

      const centerX = effectSize / 2;
      const centerY = effectSize / 2;
      const angles = [45, 80, 115, 150];

      angles.forEach(deg => {
        const rad = deg * (Math.PI / 180);
        const startX = centerX + effectSize * 0.1 * Math.cos(rad);
        const startY = centerY - effectSize * 0.1 * Math.sin(rad);
        const endX = centerX + effectSize * 0.25 * Math.cos(rad);
        const endY = centerY - effectSize * 0.25 * Math.sin(rad);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', startX);
        line.setAttribute('y1', startY);
        line.setAttribute('x2', endX);
        line.setAttribute('y2', endY);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', strokeWidth);
        line.setAttribute('stroke-linecap', 'square');
        svg.appendChild(line);

        window.gsap.timeline()
          .to(line, {
            attr: { x1: endX, y1: endY, x2: endX, y2: endY },
            translateX: (effectSize / 4) * Math.cos(rad),
            translateY: (-effectSize / 4) * Math.sin(rad),
            duration: duration,
            ease: 'power2.out'
          })
          .to(line, {
            attr: { 'stroke-width': 0 },
            duration: duration * 0.4,
            ease: 'linear'
          }, duration * 0.6);
      });

      setTimeout(() => {
        if (svg.parentNode) svg.parentNode.removeChild(svg);
      }, (duration + 0.1) * 1000);
    },

    // 3. PARTICLES - 8 radial dot particles
    particles: function (parent, x, y, color, cfg) {
      const { effectSize, strokeWidth, duration, rotation } = cfg;
      const groupWrapper = document.createElement('div');
      parent.appendChild(groupWrapper);

      for (let i = 0; i < 8; i++) {
        const rad = i * 45 * (Math.PI / 180);
        const distance = effectSize * 0.2 + Math.random() * (effectSize * 0.3);
        const finalX = x + Math.cos(rad) * distance;
        const finalY = y + Math.sin(rad) * distance;

        const dot = document.createElement('div');
        dot.style.cssText = [
          'position: absolute',
          `left: ${x - strokeWidth / 2}px`,
          `top: ${y - strokeWidth / 2}px`,
          'width: 0px',
          'height: 0px',
          `background-color: ${color}`,
          'border-radius: 50%',
          'pointer-events: none',
          `transform: rotate(${rotation}deg)`
        ].join(';');
        groupWrapper.appendChild(dot);

        window.gsap.timeline()
          .to(dot, {
            width: strokeWidth,
            height: strokeWidth,
            duration: duration * 0.2,
            ease: 'power1.out'
          })
          .to(dot, {
            left: finalX - strokeWidth / 2,
            top: finalY - strokeWidth / 2,
            duration: duration * 0.4,
            ease: 'power1.out'
          }, duration * 0.2)
          .to(dot, {
            width: 0,
            height: 0,
            left: finalX,
            top: finalY,
            duration: duration * 0.4,
            ease: 'linear'
          }, duration * 0.6);
      }

      setTimeout(() => {
        if (groupWrapper.parentNode) groupWrapper.parentNode.removeChild(groupWrapper);
      }, (duration + 0.1) * 1000);
    },

    // 4. RINGS - Expanding concentric shockwave
    rings: function (parent, x, y, color, cfg) {
      const { effectSize, strokeWidth, duration, rotation } = cfg;
      const svg = createSvg(x, y, effectSize, rotation);
      parent.appendChild(svg);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', effectSize / 2);
      circle.setAttribute('cy', effectSize / 2);
      circle.setAttribute('r', effectSize / 4);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', color);
      circle.setAttribute('stroke-width', strokeWidth);
      svg.appendChild(circle);

      window.gsap.set(svg, { scale: 0.5 });
      window.gsap.timeline()
        .to(svg, {
          scale: 2,
          duration: duration,
          ease: 'power3.out'
        }, 0)
        .to(circle, {
          attr: { 'stroke-width': 0 },
          duration: duration,
          ease: 'power3.out'
        }, 0)
        .to(svg, {
          opacity: 0,
          duration: duration * 0.2,
          ease: 'linear'
        }, duration * 0.8);

      setTimeout(() => {
        if (svg.parentNode) svg.parentNode.removeChild(svg);
      }, (duration + 0.1) * 1000);
    },

    // 5. CROSSHAIR - 4-direction crosshair lines
    crosshair: function (parent, x, y, color, cfg) {
      const { effectSize, strokeWidth, duration, rotation } = cfg;
      const svg = createSvg(x, y, effectSize, rotation);
      parent.appendChild(svg);

      const centerX = effectSize / 2;
      const centerY = effectSize / 2;
      const lineLength = effectSize * 0.3;
      const angles = [0, 90, 180, 270];

      angles.forEach(deg => {
        const rad = deg * (Math.PI / 180);
        const startX = centerX + 20 * Math.cos(rad);
        const startY = centerY - 20 * Math.sin(rad);
        const endX = centerX + (20 + lineLength) * Math.cos(rad);
        const endY = centerY - (20 + lineLength) * Math.sin(rad);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', startX);
        line.setAttribute('y1', startY);
        line.setAttribute('x2', endX);
        line.setAttribute('y2', endY);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', strokeWidth);
        line.setAttribute('stroke-linecap', 'square');
        svg.appendChild(line);

        window.gsap.timeline()
          .to(line, {
            attr: { x1: endX, y1: endY, x2: endX, y2: endY },
            duration: duration * 0.8,
            ease: 'power1.out'
          })
          .to(line, {
            attr: { 'stroke-width': 0 },
            duration: duration * 0.6,
            ease: 'linear'
          }, duration * 0.4);
      });

      setTimeout(() => {
        if (svg.parentNode) svg.parentNode.removeChild(svg);
      }, (duration + 0.1) * 1000);
    },

    // 6. WAVY - Spiral wave trails
    wavy: function (parent, x, y, color, cfg) {
      const { effectSize, strokeWidth, duration, rotation } = cfg;
      const svg = createSvg(x, y, effectSize, rotation);
      parent.appendChild(svg);

      const centerX = effectSize / 2;
      const centerY = effectSize / 2;
      const startRadius = effectSize * 0.1;
      const endRadius = effectSize * 0.5;
      const angles = [45, 90, 135, 180];

      angles.forEach(deg => {
        const rad = (deg * Math.PI) / 180;
        const startX = centerX + startRadius * Math.cos(rad);
        const startY = centerY - startRadius * Math.sin(rad);
        const endX = centerX + endRadius * Math.cos(rad);
        const endY = centerY - endRadius * Math.sin(rad);
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const waveOffset = effectSize * 0.05;
        const control1X = midX + waveOffset * Math.cos(rad + Math.PI / 2);
        const control1Y = midY - waveOffset * Math.sin(rad + Math.PI / 2);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${startX} ${startY} Q ${control1X} ${control1Y} ${midX} ${midY} T ${endX} ${endY}`);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('fill', 'none');
        svg.appendChild(path);

        const pathLength = path.getTotalLength ? path.getTotalLength() : 50;
        window.gsap.set(path, {
          strokeDasharray: `1, ${pathLength}`,
          strokeDashoffset: 0,
          strokeWidth: strokeWidth
        });

        window.gsap.timeline()
          .to(path, {
            strokeDasharray: `${pathLength}, ${pathLength}`,
            strokeDashoffset: -pathLength,
            duration: duration,
            ease: 'power1.out'
          })
          .to(path, {
            strokeWidth: 0,
            duration: duration * 0.4,
            ease: 'linear'
          }, duration * 0.6);
      });

      setTimeout(() => {
        if (svg.parentNode) svg.parentNode.removeChild(svg);
      }, (duration + 0.1) * 1000);
    }
  };

  function triggerEffect(e) {
    if (!window.gsap) return;

    const cont = ensureContainer();
    const x = e.clientX;
    const y = e.clientY;
    const color = getActiveColor(e.target);
    const mode = window.MouseEffectsConfig.interactionMode || 'sniper';

    const renderer = Effects[mode] || Effects.sniper;
    renderer(cont, x, y, color, window.MouseEffectsConfig);
  }

  function init() {
    // Check if GSAP is available, otherwise dynamically load from CDN
    if (!window.gsap) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
      script.onload = () => {
        document.addEventListener('click', triggerEffect, true);
      };
      document.head.appendChild(script);
    } else {
      document.addEventListener('click', triggerEffect, true);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
