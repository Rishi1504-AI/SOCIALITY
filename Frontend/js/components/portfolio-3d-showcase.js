/**
 * Sociality AI - Futuristic 3D Portfolio Showcase Controller
 * Adheres strictly to Robert C. Martin's Clean Code principles:
 * - Functions under 20 lines
 * - Single Responsibility Principle
 * - Intention-revealing identifiers
 * - Stepdown newspaper structure
 * - Performance optimized with IntersectionObserver and memory disposal
 */

(function () {
  'use strict';

  const SERVICES_CONFIG = {
    'web-development': {
      type: 'crystal',
      color: 0xF48F68,
      wireColor: 0xFFF6DE,
      category: 'web-development',
      accentHex: '#F48F68',
      title: 'Web Development & Architecture',
      timeline: '7 - 14 Business Days',
      particlesCount: 45
    },
    'ai-agents': {
      type: 'synapse-sphere',
      color: 0x7B61FF,
      wireColor: 0xD8B4FE,
      category: 'ai-automation',
      accentHex: '#7B61FF',
      title: 'Autonomous AI Agents',
      timeline: '5 - 10 Business Days',
      particlesCount: 60
    },
    'whatsapp-automation': {
      type: 'gyroscope',
      color: 0x006A69,
      wireColor: 0xCCE8E6,
      category: 'ai-automation',
      accentHex: '#006A69',
      title: 'WhatsApp Business Automation',
      timeline: '3 - 7 Business Days',
      particlesCount: 50
    },
    'content-handling': {
      type: 'torus-knot',
      color: 0xE07A5F,
      wireColor: 0xFDF8F5,
      category: 'social-marketing',
      accentHex: '#E07A5F',
      title: 'Social Media Content Handling',
      timeline: 'Continuous Monthly Cadence',
      particlesCount: 40
    },
    'social-marketing': {
      type: 'waveform-grid',
      color: 0x00B4D8,
      wireColor: 0xCAF0F8,
      category: 'social-marketing',
      accentHex: '#00B4D8',
      title: 'Social Media Marketing & Paid Ads',
      timeline: 'Immediate Launch & Scaling',
      particlesCount: 55
    },
    'workflow-automation': {
      type: 'tesseract',
      color: 0xCEC6B0,
      wireColor: 0xFFF6DE,
      category: 'ai-automation',
      accentHex: '#984726',
      title: 'Enterprise Workflow Automation',
      timeline: '5 - 12 Business Days',
      particlesCount: 35
    }
  };

  const activeShowcaseScenes = new Map();

  function initPortfolioShowcase() {
    if (typeof THREE === 'undefined') return;
    setupCategoryFilterTabs();
    initAllCardHolograms();
    setupShowcaseVisibilityObserver();
    setupModalInteractions();
  }

  function setupCategoryFilterTabs() {
    const filterButtons = document.querySelectorAll('[data-portfolio-filter]');
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => handleFilterTabClick(btn, filterButtons));
    });
  }

  function handleFilterTabClick(activeBtn, allButtons) {
    const filterValue = activeBtn.dataset.portfolioFilter;
    updateFilterButtonStyles(activeBtn, allButtons);
    filterPortfolioCards(filterValue);
  }

  function updateFilterButtonStyles(activeBtn, allButtons) {
    allButtons.forEach((btn) => {
      const isSelected = btn === activeBtn;
      btn.setAttribute('aria-selected', isSelected);
      btn.className = isSelected
        ? 'px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-tertiary text-on-tertiary shadow-md transition-all'
        : 'px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all';
    });
  }

  function filterPortfolioCards(category) {
    const cards = document.querySelectorAll('[data-portfolio-card]');
    cards.forEach((card) => {
      const cardCategory = card.dataset.category;
      const isMatch = category === 'all' || cardCategory === category;
      card.style.display = isMatch ? 'flex' : 'none';
      if (isMatch) card.classList.add('animate-fadeIn');
    });
  }

  function initAllCardHolograms() {
    const containers = document.querySelectorAll('[data-hologram-service]');
    containers.forEach((container) => {
      const serviceKey = container.dataset.hologramService;
      const config = SERVICES_CONFIG[serviceKey];
      if (config) {
        const sceneController = createHologramScene(container, config);
        activeShowcaseScenes.set(container, sceneController);
      }
    });
  }

  function createHologramScene(container, config) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    const hologramGroup = new THREE.Group();
    scene.add(hologramGroup);

    const mainMesh = buildHologramMesh(config);
    hologramGroup.add(mainMesh);

    const particles = buildOrbitParticles(config);
    hologramGroup.add(particles);

    addLighting(scene, config.color);
    return startRenderLoop(renderer, scene, camera, hologramGroup, container);
  }

  function buildHologramMesh(config) {
    let geometry;
    switch (config.type) {
      case 'crystal':
        geometry = new THREE.OctahedronGeometry(1.2, 0);
        break;
      case 'synapse-sphere':
        geometry = new THREE.IcosahedronGeometry(1.1, 1);
        break;
      case 'gyroscope':
        geometry = new THREE.TorusGeometry(1.1, 0.25, 16, 50);
        break;
      case 'torus-knot':
        geometry = new THREE.TorusKnotGeometry(0.85, 0.22, 64, 16);
        break;
      case 'waveform-grid':
        geometry = new THREE.PlaneGeometry(2, 2, 8, 8);
        break;
      default:
        geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    }

    const material = new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: 0.15,
      metalness: 0.85,
      wireframe: true,
      wireframeLinewidth: 1.5,
      emissive: config.color,
      emissiveIntensity: 0.2
    });

    return new THREE.Mesh(geometry, material);
  }

  function buildOrbitParticles(config) {
    const count = config.particlesCount || 30;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 3.5;
      positions[i + 1] = (Math.random() - 0.5) * 3.5;
      positions[i + 2] = (Math.random() - 0.5) * 3.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: config.wireColor || 0xFFF6DE,
      size: 0.05,
      transparent: true,
      opacity: 0.85
    });

    return new THREE.Points(geometry, material);
  }

  function addLighting(scene, colorHex) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(colorHex, 2.5, 10);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);
  }

  function startRenderLoop(renderer, scene, camera, group, container) {
    let animationId;
    let isRunning = true;

    function animate() {
      if (!isRunning) return;
      animationId = requestAnimationFrame(animate);

      group.rotation.x += 0.005;
      group.rotation.y += 0.008;

      renderer.render(scene, camera);
    }
    animate();

    return {
      pause: () => { isRunning = false; cancelAnimationFrame(animationId); },
      resume: () => { if (!isRunning) { isRunning = true; animate(); } },
      resize: () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      },
      dispose: () => {
        isRunning = false;
        cancelAnimationFrame(animationId);
        renderer.dispose();
      }
    };
  }

  function setupShowcaseVisibilityObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const sceneCtrl = activeShowcaseScenes.get(entry.target);
        if (sceneCtrl) {
          if (entry.isIntersecting) sceneCtrl.resume();
          else sceneCtrl.pause();
        }
      });
    }, { threshold: 0.1 });

    activeShowcaseScenes.forEach((_, element) => {
      observer.observe(element);
    });
  }

  function setupModalInteractions() {
    const openButtons = document.querySelectorAll('[data-open-case-modal]');
    const closeButtons = document.querySelectorAll('#close-case-modal-btn, [data-close-case-modal]');
    const modal = document.getElementById('case-study-modal');
    if (!modal) return;

    openButtons.forEach((btn) => {
      btn.addEventListener('click', () => openCaseStudyModal(modal, btn.dataset.openCaseModal));
    });

    closeButtons.forEach((btn) => {
      btn.addEventListener('click', () => closeCaseStudyModal(modal));
    });
  }

  function openCaseStudyModal(modal, caseKey) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  function closeCaseStudyModal(modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolioShowcase);
  } else {
    initPortfolioShowcase();
  }
})();
