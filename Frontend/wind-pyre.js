/**
 * Sociality AI - Wind Pyre — Originkit
 * Wall of flame that leans in the wind and catches on hover.
 * Dedicated to the CTA Banner ("Ready to build something extraordinary?").
 *
 * Implements Robert C. Martin's Clean Code principles:
 * - Functions under 20 lines
 * - Single Responsibility Principle (SRP)
 * - Intention-revealing identifiers
 * - Stepdown newspaper architecture
 * - 60 FPS GPU-accelerated WebGL with IntersectionObserver pause
 */

(function () {
  'use strict';

  if (window.__windPyreLoaded) return;
  window.__windPyreLoaded = true;

  // 1. Wind Pyre Preset Constants
  const DEFAULTS = {
    soot: '#0C0604',
    ember: '#A82208',
    flame: '#FF7A1E',
    spark: '#FFE86B',
    highlight: '#929292',
    rise: 20,
    turbulence: 20,
    detail: 20,
    exposure: 10,
    shade: 5,
    edgeSoftness: 1,
    glowOn: true,
    glow: { color: '#FF7A1E', strength: 6 },
    speed: 11,
    spin: 0,
    hoverIntensity: 40,
    wind: 100,
    sizePercent: 47
  };

  const BASE_RADIUS = 0.72;

  function clamp(v, lo, hi, fallback) {
    const n = typeof v === 'number' && isFinite(v) ? v : fallback;
    return Math.max(lo, Math.min(hi, n));
  }

  function computeSettings(cfg) {
    const glow = cfg.glow || DEFAULTS.glow;
    return {
      speed: clamp(cfg.speed, 0, 20, DEFAULTS.speed) * 0.09,
      rise: clamp(cfg.rise, 0, 20, DEFAULTS.rise) * 0.1,
      turbulence: clamp(cfg.turbulence, 0, 20, DEFAULTS.turbulence) * 0.1,
      detail: 1.0 + clamp(cfg.detail, 1, 20, DEFAULTS.detail) * 0.2,
      exposure: 0.3 + clamp(cfg.exposure, 1, 20, DEFAULTS.exposure) * 0.1,
      shade: clamp(cfg.shade, 0, 20, DEFAULTS.shade) * 0.075,
      edgeSoftness: 0.01 + clamp(cfg.edgeSoftness, 1, 20, DEFAULTS.edgeSoftness) * 0.009,
      glowStrength: cfg.glowOn ? clamp(glow.strength, 0, 20, DEFAULTS.glow.strength) * 0.05 : 0,
      glowColor: glow.color || DEFAULTS.glow.color,
      spin: clamp(cfg.spin, 0, 20, DEFAULTS.spin) * 0.06,
      hoverIntensity: clamp(cfg.hoverIntensity, 0, 100, DEFAULTS.hoverIntensity) * 0.01,
      wind: clamp(cfg.wind, 0, 100, DEFAULTS.wind) * 0.01,
      radius: BASE_RADIUS * clamp(cfg.sizePercent, 20, 200, 100) * 0.01
    };
  }

  // 2. Shaders
  const QUAD_VERTEX = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;

  const PYRE_FRAGMENT = /* glsl */ `
    precision highp float;

    uniform vec2 uResolution;
    uniform vec3 uSoot;
    uniform vec3 uEmber;
    uniform vec3 uFlame;
    uniform vec3 uSpark;
    uniform vec3 uHighlight;
    uniform vec3 uGlowColor;
    uniform float uTime;
    uniform float uRise;
    uniform float uTurbulence;
    uniform float uDetail;
    uniform float uExposure;
    uniform float uShade;
    uniform float uEdgeSoftness;
    uniform float uGlowStrength;
    uniform float uRadius;
    uniform float uYaw;
    uniform float uHover;
    uniform float uHoverIntensity;
    uniform float uLean;

    varying vec2 vUv;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    float fbm(vec2 p, float oct) {
      float sum = 0.0;
      float amp = 0.5;
      float norm = 0.0;
      for (int i = 0; i < 5; i++) {
        float w = clamp(oct - float(i), 0.0, 1.0);
        if (w > 0.0) {
          sum += noise(p) * amp * w;
          norm += amp * w;
        }
        p *= 2.03;
        p = mat2(0.8, 0.6, -0.6, 0.8) * p;
        amp *= 0.5;
      }
      return sum / max(0.0001, norm);
    }

    vec3 ramp(float t) {
      vec3 c = mix(uSoot, uEmber, smoothstep(0.02, 0.40, t));
      c = mix(c, uFlame, smoothstep(0.32, 0.72, t));
      return mix(c, uSpark, smoothstep(0.64, 1.0, t));
    }

    void main() {
      vec2 screen = vUv - 0.5;
      screen.x *= uResolution.x / max(1.0, uResolution.y);
      vec2 uv = screen / max(0.0001, uRadius);

      float h = uv.y * 0.5 + 0.5;
      vec2 p = uv * 1.55 - vec2(uYaw + uLean * h * h, 0.0);
      vec2 drift = vec2(0.0, uTime * uRise);
      float wOct = min(uDetail, 3.0);
      vec2 warp = vec2(
        fbm(p * 2.6 - drift * 1.35, wOct),
        fbm(p * 2.6 - drift * 1.15 + vec2(5.2, 1.3), wOct)
      );
      float n = fbm(p + warp * uTurbulence * 2.2 - drift, uDetail);

      float crownFade = smoothstep(-0.15, 1.05 + uEdgeSoftness * 2.0, h);
      float heat = n * mix(1.5, 0.12, crownFade);
      heat = clamp(heat * uExposure * (1.0 + uHover * uHoverIntensity), 0.0, 1.0);

      vec3 col = ramp(heat);
      col += uHighlight * heat * smoothstep(0.4, -0.6, uv.y) * 0.25;
      col += uGlowColor * uGlowStrength * heat * heat * 0.06 * (1.0 + uHover * uHoverIntensity);
      col *= mix(1.0, 0.4, clamp(uShade, 0.0, 1.0));

      float alpha = smoothstep(0.01, 0.28, heat);
      gl_FragColor = vec4(col, alpha);
    }
  `;

  // 3. Scene Engine
  class PyreScene {
    constructor(container, triggerSection, cfg) {
      this.container = container;
      this.triggerSection = triggerSection || container;
      this.cfg = cfg;
      this.S = computeSettings(cfg);

      this.scene = new THREE.Scene();
      this.camera = new THREE.Camera();
      this.geometry = new THREE.PlaneGeometry(2, 2);

      this.time = 0;
      this.yaw = 0;
      this.hoverTarget = 0;
      this.hover = 0;
      this.windTime = 0;
      this.lean = 0;
      this.leanVel = 0;

      this.frameId = 0;
      this.lastT = 0;
      this.disposed = false;
      this.isVisible = true;

      this.initRenderer();
      this.initMaterial();
      this.bindEvents();
    }

    initRenderer() {
      this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      if (THREE.SRGBColorSpace) this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.setClearColor(0x000000, 0);

      const el = this.renderer.domElement;
      el.style.position = 'absolute';
      el.style.inset = '0';
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.borderRadius = 'inherit';
      el.style.pointerEvents = 'none';
      this.container.appendChild(el);
    }

    initMaterial() {
      const cfg = this.cfg;
      const S = this.S;

      this.material = new THREE.ShaderMaterial({
        vertexShader: QUAD_VERTEX,
        fragmentShader: PYRE_FRAGMENT,
        uniforms: {
          uResolution: { value: new THREE.Vector2(1, 1) },
          uSoot: { value: new THREE.Color(cfg.soot) },
          uEmber: { value: new THREE.Color(cfg.ember) },
          uFlame: { value: new THREE.Color(cfg.flame) },
          uSpark: { value: new THREE.Color(cfg.spark) },
          uHighlight: { value: new THREE.Color(cfg.highlight) },
          uGlowColor: { value: new THREE.Color(S.glowColor) },
          uTime: { value: 0 },
          uRise: { value: S.rise },
          uTurbulence: { value: S.turbulence },
          uDetail: { value: S.detail },
          uExposure: { value: S.exposure },
          uShade: { value: S.shade },
          uEdgeSoftness: { value: S.edgeSoftness },
          uGlowStrength: { value: S.glowStrength },
          uRadius: { value: S.radius },
          uYaw: { value: 0 },
          uHover: { value: 0 },
          uHoverIntensity: { value: S.hoverIntensity },
          uLean: { value: 0 }
        },
        transparent: true,
        depthTest: false,
        depthWrite: false
      });

      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.mesh.frustumCulled = false;
      this.scene.add(this.mesh);
    }

    bindEvents() {
      const onEnter = () => { this.hoverTarget = 1; };
      const onLeave = () => { this.hoverTarget = 0; };

      this.triggerSection.addEventListener('pointerenter', onEnter);
      this.triggerSection.addEventListener('pointerleave', onLeave);

      this.unbind = () => {
        this.triggerSection.removeEventListener('pointerenter', onEnter);
        this.triggerSection.removeEventListener('pointerleave', onLeave);
      };
    }

    start() {
      this.lastT = performance.now();
      const loop = () => {
        if (!this.disposed) {
          this.frameId = requestAnimationFrame(loop);
          if (this.isVisible) this.step();
        }
      };
      loop();
    }

    setSize(width, height) {
      if (this.disposed || width <= 0 || height <= 0) return;
      this.renderer.setSize(width, height, false);
      this.material.uniforms.uResolution.value.set(width, height);
    }

    step() {
      const now = performance.now();
      let dt = (now - this.lastT) / 1000;
      this.lastT = now;
      if (!isFinite(dt) || dt < 0) dt = 0;
      if (dt > 0.05) dt = 0.05;

      const S = this.S;
      this.time += dt * S.speed;
      this.yaw += S.spin * dt;

      const hoverRate = this.hoverTarget > this.hover ? 6 : 3;
      this.hover += (this.hoverTarget - this.hover) * Math.min(1, dt * hoverRate);

      this.windTime += dt;
      const gustAmplitude = S.wind * 0.4;
      const gustTarget = (Math.sin(this.windTime * 0.9) * 0.6 + Math.sin(this.windTime * 0.37 + 1.7) * 0.4) * gustAmplitude;
      const springAccel = (gustTarget - this.lean) * 26 - this.leanVel * 6.5;
      this.leanVel += springAccel * dt;
      this.lean += this.leanVel * dt;

      const u = this.material.uniforms;
      u.uTime.value = this.time;
      u.uYaw.value = this.yaw;
      u.uHover.value = this.hover;
      u.uLean.value = this.lean;

      this.renderer.render(this.scene, this.camera);
    }

    dispose() {
      this.disposed = true;
      cancelAnimationFrame(this.frameId);
      if (this.unbind) this.unbind();
      this.geometry.dispose();
      this.material.dispose();
      this.renderer.dispose();
      const el = this.renderer.domElement;
      if (el.parentNode === this.container) this.container.removeChild(el);
    }
  }

  // 4. Initialization & Lifecycle
  function initWindPyre() {
    if (typeof THREE === 'undefined') {
      setTimeout(initWindPyre, 80);
      return;
    }

    const sections = document.querySelectorAll('[data-wind-pyre-section], .cta-banner-pyre');
    sections.forEach((section) => setupSectionPyre(section));
  }

  function setupSectionPyre(section) {
    if (section.dataset.windPyreInit) return;
    section.dataset.windPyreInit = 'true';

    let canvasContainer = section.querySelector('[data-wind-pyre-canvas]');
    if (!canvasContainer) {
      canvasContainer = document.createElement('div');
      canvasContainer.setAttribute('data-wind-pyre-canvas', 'true');
      canvasContainer.style.position = 'absolute';
      canvasContainer.style.inset = '0';
      canvasContainer.style.width = '100%';
      canvasContainer.style.height = '100%';
      canvasContainer.style.pointerEvents = 'none';
      canvasContainer.style.overflow = 'hidden';
      canvasContainer.style.borderRadius = 'inherit';
      canvasContainer.style.zIndex = '0';
      canvasContainer.style.mixBlendMode = 'screen';
      canvasContainer.style.opacity = '0.92';
      section.insertBefore(canvasContainer, section.firstChild);
    }

    const scene = new PyreScene(canvasContainer, section, DEFAULTS);
    scene.setSize(canvasContainer.clientWidth || section.clientWidth, canvasContainer.clientHeight || section.clientHeight);
    scene.start();

    const ro = new ResizeObserver(() => {
      scene.setSize(canvasContainer.clientWidth || section.clientWidth, canvasContainer.clientHeight || section.clientHeight);
    });
    ro.observe(section);

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        scene.isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    io.observe(section);
  }

  // 5. Execution Hook
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWindPyre);
  } else {
    initWindPyre();
  }
  window.addEventListener('load', initWindPyre);
})();
