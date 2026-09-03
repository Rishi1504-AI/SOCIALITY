/**
 * Sociality AI - Interactive Workflow Storytelling
 * Uses GSAP & ScrollTrigger to animate SVG energy journey and act cards.
 *
 * Implements Robert C. Martin's Clean Code principles:
 * - Functions under 20 lines
 * - Single Responsibility Principle (SRP)
 * - Intention-revealing identifiers
 * - Stepdown newspaper structure
 */

(function () {
  'use strict';

  function initWorkflowStorytelling() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const triggerEl = document.querySelector('#workflow-storytelling');
    if (!triggerEl) return;

    prepareSvgStrokePaths();
    const tl = createScrollTimeline(triggerEl);
    buildTimelineSequence(tl);
    setupInteractiveNodes();
  }

  function prepareSvgStrokePaths() {
    setupPathDash('#journey-path', 1000);
    setupDynamicPathDash('#infinity-path', 100);
    setupDynamicPathDash('#analytics-chart-path', 200);
  }

  function setupPathDash(selector, defaultLength) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.style.strokeDasharray = defaultLength;
    el.style.strokeDashoffset = defaultLength;
  }

  function setupDynamicPathDash(selector, defaultLength) {
    const el = document.querySelector(selector);
    if (!el) return;
    const len = el.getTotalLength ? (el.getTotalLength() || defaultLength) : defaultLength;
    el.style.strokeDasharray = len;
    el.style.strokeDashoffset = len;
  }

  function createScrollTimeline(triggerEl) {
    return gsap.timeline({
      scrollTrigger: {
        trigger: triggerEl,
        start: 'top top',
        end: '+=400%',
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true
      }
    });
  }

  function buildTimelineSequence(tl) {
    tl.to('#journey-path', { strokeDashoffset: 0, ease: 'none', duration: 10 }, 0);
    tl.to('#journey-orb', { top: '100%', ease: 'none', duration: 10 }, 0);

    buildActTransition(tl, 1, 0, 2);
    buildActTransition(tl, 2, 2, 4);
    tl.to('#audit-ai-card', { borderColor: '#F48F68', boxShadow: '0 0 30px rgba(244,143,104,0.3)', duration: 0.5 }, 2.5);

    buildActTransition(tl, 3, 4, 6);
    buildActTransition(tl, 4, 6, 8);
    buildActTransition(tl, 5, 8, 10);

    const chartPath = document.querySelector('#analytics-chart-path');
    const infPath = document.querySelector('#infinity-path');
    if (chartPath) tl.to(chartPath, { strokeDashoffset: 0, duration: 1.5, ease: 'power1.out' }, 8.5);
    if (infPath) tl.to(infPath, { strokeDashoffset: 0, duration: 1.5, ease: 'power1.out' }, 8.5);
  }

  function buildActTransition(tl, actNum, startTime, endTime) {
    tl.to(`#act-${actNum}-text`, { opacity: 1, y: 0, pointerEvents: 'auto', duration: 1 }, startTime);
    tl.to(`#act-${actNum}-visual`, { opacity: 1, scale: 1, duration: 1 }, startTime);
    if (endTime < 10) {
      tl.to(`#act-${actNum}-text`, { opacity: 0, y: -20, pointerEvents: 'none', duration: 1 }, endTime);
      tl.to(`#act-${actNum}-visual`, { opacity: 0, scale: 0.95, duration: 1 }, endTime);
    }
  }

  function setupInteractiveNodes() {
    const sandbox = document.querySelector('#workflow-storytelling .grid > div:last-child');
    if (!sandbox) return;

    for (let i = 0; i < 6; i++) {
      const node = document.createElement('div');
      node.className = 'absolute w-1.5 h-1.5 rounded-full bg-[#F48F68]/20 pointer-events-none';
      node.style.top = `${15 + Math.random() * 70}%`;
      node.style.left = `${10 + Math.random() * 80}%`;
      sandbox.appendChild(node);
      animateNode(node);
    }
  }

  function animateNode(node) {
    gsap.to(node, {
      y: 'random(-15, 15)',
      x: 'random(-15, 15)',
      opacity: 'random(0.1, 0.6)',
      duration: 'random(2, 4)',
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWorkflowStorytelling);
  } else {
    initWorkflowStorytelling();
  }
})();
