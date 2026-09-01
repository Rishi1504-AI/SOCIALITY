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

  // 1. Sociality Agency Services Configuration & 3D Geometry Mappings
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

  // 2. High-Level Lifecycle Initialization
  function initPortfolioShowcase() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not found for 3D Portfolio showcase.');
      return;
    }
    setupCategoryFilterTabs();
    initAllCardHolograms();
    setupShowcaseVisibilityObserver();
    setupModalInteractions();
  }

  // 3. Category Filter Management
  function setupCategoryFilterTabs() {
    const filterButtons = document.querySelectorAll('[data-portfolio-filter]');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => handleFilterTabClick(btn, filterButtons));
    });
  }

  function handleFilterTabClick(activeBtn, allButtons) {
    updateFilterButtonStyles(activeBtn, allButtons);
    const selectedCategory = activeBtn.getAttribute('data-portfolio-filter');
    filterPortfolioCards(selectedCategory);
  }

  function updateFilterButtonStyles(activeBtn, allButtons) {
    allButtons.forEach(btn => {
      btn.classList.remove('bg-tertiary', 'text-on-tertiary', 'shadow-md');
      btn.classList.add('bg-surface-container', 'text-on-surface-variant');
    });
    activeBtn.classList.remove('bg-surface-container', 'text-on-surface-variant');
    activeBtn.classList.add('bg-tertiary', 'text-on-tertiary', 'shadow-md');
  }

  function filterPortfolioCards(category) {
    const cards = document.querySelectorAll('[data-portfolio-card]');
    cards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      const isVisible = (category === 'all' || cardCategory === category);
      animateCardVisibility(card, isVisible);
    });
  }

  function animateCardVisibility(card, shouldShow) {
    if (shouldShow) {
      card.classList.remove('hidden');
      requestAnimationFrame(() => {
        card.classList.remove('opacity-0', 'scale-95');
        card.classList.add('opacity-100', 'scale-100');
      });
    } else {
      card.classList.add('opacity-0', 'scale-95');
      setTimeout(() => card.classList.add('hidden'), 250);
    }
  }

  // 4. Per-Card 3D Hologram Setup
  function initAllCardHolograms() {
    const canvasElements = document.querySelectorAll('.portfolio-3d-canvas');
    canvasElements.forEach(canvas => {
      const serviceId = canvas.getAttribute('data-project-id');
      const config = SERVICES_CONFIG[serviceId];
      if (config) {
        setupCardScene(canvas, config);
      }
    });
  }

  function setupCardScene(canvas, config) {
    const renderer = createCardRenderer(canvas);
    const scene = new THREE.Scene();
    const camera = createCardCamera();
    const objectGroup = new THREE.Group();

    const mainMesh = createHologramMesh(config.type, config.color, config.wireColor);
    const particleField = createParticleField(config.particlesCount, config.color);

    objectGroup.add(mainMesh);
    objectGroup.add(particleField);
    scene.add(objectGroup);
    addHologramLighting(scene, config.color);

    const sceneData = {
      canvas,
      renderer,
      scene,
      camera,
      objectGroup,
      mainMesh,
      targetRotation: { x: 0, y: 0 },
      isHovered: false,
      isRunning: true
    };

    activeShowcaseScenes.set(canvas, sceneData);
    attachCardPointerListeners(canvas, sceneData);
    startCardAnimationLoop(sceneData);
  }

  function createCardRenderer(canvas) {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    resizeRendererToDisplaySize(renderer);
    return renderer;
  }

  function createCardCamera() {
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.2;
    return camera;
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth || 320;
    const height = canvas.clientHeight || 240;
    renderer.setSize(width, height, false);
  }

  // 5. Procedural Hologram Geometry Factories
  function createHologramMesh(type, primaryColor, wireColor) {
    switch (type) {
      case 'crystal':
        return createCrystalMesh(primaryColor, wireColor);
      case 'gyroscope':
        return createGyroscopeMesh(primaryColor, wireColor);
      case 'torus-knot':
        return createTorusKnotMesh(primaryColor, wireColor);
      case 'synapse-sphere':
        return createSynapseSphereMesh(primaryColor, wireColor);
      case 'tesseract':
        return createTesseractMesh(primaryColor, wireColor);
      case 'waveform-grid':
        return createWaveformGridMesh(primaryColor, wireColor);
      default:
        return createCrystalMesh(primaryColor, wireColor);
    }
  }

  function createCrystalMesh(color, wireColor) {
    const group = new THREE.Group();
    const geometry = new THREE.OctahedronGeometry(1.2, 0);
    const wireMat = new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true, transparent: true, opacity: 0.85 });
    const solidMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.22 });

    group.add(new THREE.Mesh(geometry, solidMat));
    group.add(new THREE.Mesh(geometry, wireMat));
    return group;
  }

  function createGyroscopeMesh(color, wireColor) {
    const group = new THREE.Group();
    const ring1 = new THREE.TorusGeometry(1.2, 0.04, 16, 64);
    const ring2 = new THREE.TorusGeometry(0.9, 0.04, 16, 64);
    const core = new THREE.SphereGeometry(0.35, 16, 16);

    const mat1 = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.9 });
    const mat2 = new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true, transparent: true, opacity: 0.8 });
    const coreMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 });

    const mesh1 = new THREE.Mesh(ring1, mat1);
    const mesh2 = new THREE.Mesh(ring2, mat2);
    mesh2.rotation.x = Math.PI / 2;

    group.add(mesh1);
    group.add(mesh2);
    group.add(new THREE.Mesh(core, coreMat));
    return group;
  }

  function createTorusKnotMesh(color, wireColor) {
    const group = new THREE.Group();
    const geometry = new THREE.TorusKnotGeometry(0.8, 0.22, 64, 16, 2, 3);
    const wireMat = new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true, transparent: true, opacity: 0.8 });
    const solidMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.25 });

    group.add(new THREE.Mesh(geometry, solidMat));
    group.add(new THREE.Mesh(geometry, wireMat));
    return group;
  }

  function createSynapseSphereMesh(color, wireColor) {
    const group = new THREE.Group();
    const geometry = new THREE.IcosahedronGeometry(1.1, 2);
    const wireMat = new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true, transparent: true, opacity: 0.85 });
    const pointMat = new THREE.PointsMaterial({ color, size: 0.06, transparent: true, opacity: 0.95 });

    group.add(new THREE.Mesh(geometry, wireMat));
    group.add(new THREE.Points(geometry, pointMat));
    return group;
  }

  function createTesseractMesh(color, wireColor) {
    const group = new THREE.Group();
    const outerBox = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const innerBox = new THREE.BoxGeometry(0.85, 0.85, 0.85);

    const outerMat = new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true, transparent: true, opacity: 0.75 });
    const innerMat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.95 });

    group.add(new THREE.Mesh(outerBox, outerMat));
    group.add(new THREE.Mesh(innerBox, innerMat));
    return group;
  }

  function createWaveformGridMesh(color, wireColor) {
    const group = new THREE.Group();
    const geometry = new THREE.PlaneGeometry(2.0, 2.0, 14, 14);
    const pos = geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = Math.sin(x * 3.5) * Math.cos(y * 3.5) * 0.3;
      pos.setZ(i, z);
    }
    geometry.computeVertexNormals();

    const wireMat = new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true, transparent: true, opacity: 0.85 });
    const mesh = new THREE.Mesh(geometry, wireMat);
    mesh.rotation.x = -Math.PI / 3;
    group.add(mesh);
    return group;
  }

  function createParticleField(count, color) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 3.2;
      positions[i + 1] = (Math.random() - 0.5) * 3.2;
      positions[i + 2] = (Math.random() - 0.5) * 3.2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color, size: 0.035, transparent: true, opacity: 0.7 });
    return new THREE.Points(geometry, material);
  }

  function addHologramLighting(scene, color) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    const pointLight = new THREE.PointLight(color, 2, 8);
    pointLight.position.set(2, 2, 3);
    scene.add(ambientLight);
    scene.add(pointLight);
  }

  // 6. Interaction & Animation Frame Loop
  function attachCardPointerListeners(canvas, sceneData) {
    const card = canvas.closest('[data-portfolio-card]');
    if (!card) return;

    card.addEventListener('pointerenter', () => {
      sceneData.isHovered = true;
      resizeRendererToDisplaySize(sceneData.renderer);
    });

    card.addEventListener('pointerleave', () => {
      sceneData.isHovered = false;
      sceneData.targetRotation.x = 0;
      sceneData.targetRotation.y = 0;
    });

    card.addEventListener('pointermove', (event) => {
      if (!sceneData.isHovered) return;
      const rect = card.getBoundingClientRect();
      const normX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      sceneData.targetRotation.y = normX * 0.9;
      sceneData.targetRotation.x = normY * 0.6;
    });
  }

  function startCardAnimationLoop(sceneData) {
    function animate() {
      if (!sceneData.isRunning) return;
      updateSceneRotation(sceneData);
      sceneData.renderer.render(sceneData.scene, sceneData.camera);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  function updateSceneRotation(sceneData) {
    const speed = sceneData.isHovered ? 0.025 : 0.008;
    sceneData.objectGroup.rotation.y += speed;
    sceneData.objectGroup.rotation.x += speed * 0.4;

    // Smooth spring interpolation to target mouse tilt
    sceneData.objectGroup.rotation.y += (sceneData.targetRotation.y - sceneData.objectGroup.rotation.y) * 0.06;
    sceneData.objectGroup.rotation.x += (sceneData.targetRotation.x - sceneData.objectGroup.rotation.x) * 0.06;
  }

  // 7. Offscreen Visibility Pausing (High Performance Optimization)
  function setupShowcaseVisibilityObserver() {
    const portfolioSection = document.getElementById('portfolio');
    if (!portfolioSection || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => toggleScenesExecution(entry.isIntersecting));
    }, { threshold: 0.1 });

    observer.observe(portfolioSection);
  }

  function toggleScenesExecution(shouldRun) {
    activeShowcaseScenes.forEach(sceneData => {
      const wasRunning = sceneData.isRunning;
      sceneData.isRunning = shouldRun;
      if (shouldRun && !wasRunning) {
        startCardAnimationLoop(sceneData);
      }
    });
  }

  // 8. Interactive 3D Case Study Modal
  function setupModalInteractions() {
    const modalTriggers = document.querySelectorAll('[data-open-case-modal]');
    const modal = document.getElementById('portfolio-case-modal');
    if (!modal) return;

    modalTriggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const projectId = btn.getAttribute('data-open-case-modal');
        openCaseStudyModal(projectId);
      });
    });

    const closeBtn = document.getElementById('close-case-modal-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeCaseStudyModal);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeCaseStudyModal();
    });
  }

  function openCaseStudyModal(serviceId) {
    const modal = document.getElementById('portfolio-case-modal');
    if (!modal) return;

    const config = SERVICES_CONFIG[serviceId];
    const titleEl = document.getElementById('modal-project-title');
    const descEl = document.getElementById('modal-project-desc');
    const catEl = document.getElementById('modal-project-category');
    const card = document.querySelector(`[data-project-id="${serviceId}"]`)?.closest('[data-portfolio-card]');

    if (card && titleEl && descEl) {
      const cardTitle = card.querySelector('h3')?.textContent || (config ? config.title : 'Service Overview');
      const cardDesc = card.querySelector('p')?.textContent || '';
      const cardCat = card.querySelector('[data-category-badge]')?.textContent || 'Agency Solution';
      titleEl.textContent = cardTitle;
      descEl.textContent = cardDesc;
      if (catEl) catEl.textContent = cardCat;
    }

    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }

  function closeCaseStudyModal() {
    const modal = document.getElementById('portfolio-case-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }

  // Execute on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolioShowcase);
  } else {
    initPortfolioShowcase();
  }
})();
