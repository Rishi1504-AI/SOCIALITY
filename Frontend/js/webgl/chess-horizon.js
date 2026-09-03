/**
 * Chess Horizon — Originkit (Vanilla WebGL Edition)
 * A WebGL checkerboard plane in real pinhole perspective that scrolls toward
 * the camera while the pointer acts as a lamp lighting the square it stands on.
 *
 * Implements Robert C. Martin's Clean Code principles:
 * - Functions strictly under 20 lines
 * - Single Responsibility Principle (SRP)
 * - Intention-revealing identifiers
 * - Stepdown newspaper architecture
 * - 60 FPS GPU-accelerated WebGL with IntersectionObserver pause
 */

(function () {
  'use strict';

  const MAX_DPR = 2;
  const HOVER_RATE = 5;
  const CAM_HEIGHT = 1.0;
  const SCROLL_RATE = 0.5;
  const IDLE_Z = 3.2;

  function parseColor(input, fallback) {
    if (!input) return fallback;
    const str = String(input).trim();
    if (str.charAt(0) === '#') {
      let hex = str.slice(1);
      if (hex.length === 3 || hex.length === 4) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      if (hex.length >= 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r / 255, g / 255, b / 255];
      }
      return fallback;
    }
    const parts = str.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      return [
        Math.min(255, parseFloat(parts[0])) / 255,
        Math.min(255, parseFloat(parts[1])) / 255,
        Math.min(255, parseFloat(parts[2])) / 255
      ];
    }
    return fallback;
  }

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  function num(v, fallback) {
    return typeof v === 'number' && isFinite(v) ? v : fallback;
  }

  const VERT_SRC = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

  const FRAG_SRC = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  uRes;
uniform float uTime;
uniform float uDpr;

uniform vec3  uBg;
uniform vec3  uBase;
uniform vec3  uAccent;
uniform float uHorizon;
uniform float uFocal;
uniform float uCamH;
uniform float uSquare;
uniform float uPanZ;
uniform vec2  uLamp;
uniform vec2  uSelQ;
uniform float uLampH;
uniform float uLampAmt;
uniform float uHaze;
uniform float uGrain;

const float AMBIENT = 0.17;

float h21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float filmGrain(vec2 fragCoord, float t, float dpr) {
    vec2 cell = floor(fragCoord / max(dpr, 1.0));
    return h21(cell + floor(t * 24.0) * 13.7) - 0.5;
}

float checkerBox(vec2 p, vec2 w) {
    vec2 i = 2.0 * (abs(fract((p - 0.5 * w) * 0.5) - 0.5)
                  - abs(fract((p + 0.5 * w) * 0.5) - 0.5)) / w;
    return 0.5 - 0.5 * i.x * i.y;
}

void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    float aspect = uRes.x / uRes.y;

    float sx = (uv.x - 0.5) * aspect;
    float sy = uv.y;
    float px = 1.0 / uRes.y;

    float yy = uHorizon - sy;
    vec3 col;

    if (yy <= px) {
        col = uBg * (1.0 - 0.35 * smoothstep(0.0, 0.45, -yy));
    } else {
        float z = uCamH * uFocal / yy;
        float wx = sx * z / uFocal;

        float dzdy = z * z / (uCamH * uFocal);
        float dxdx = z / uFocal;
        float dxdy = wx * z / (uCamH * uFocal);

        vec2 q = vec2(wx, z) / uSquare + vec2(0.0, uPanZ);
        vec2 fw = vec2(
            (abs(dxdx) + abs(dxdy)) * px / uSquare,
            abs(dzdy) * px / uSquare
        );

        float c = checkerBox(q, max(fw, vec2(1e-5)));
        col = mix(uBase, uAccent, c);

        vec2 dcell = abs(floor(q) - floor(uSelQ));
        float same = (1.0 - step(0.5, dcell.x)) * (1.0 - step(0.5, dcell.y));
        vec2 fc = abs(fract(q) - 0.5);
        float edge = 0.5 - max(fc.x, fc.y);
        float feather = max(fw.x + fw.y, 1e-4);
        float ring = 1.0 - smoothstep(feather, feather + 0.07, edge);
        col += uAccent * same * (0.18 + 0.65 * ring) * uLampAmt;

        vec2 toLamp = vec2(wx, z) - uLamp;
        float d2 = dot(toLamp, toLamp) + uLampH * uLampH;
        float lit = (uLampH * uLampH * uLampH) / (d2 * sqrt(d2));
        col *= AMBIENT + 1.35 * lit * uLampAmt;

        float fog = 1.0 - exp(-z * uHaze);
        col = mix(col, uBg, clamp(fog, 0.0, 1.0));
    }

    col += (h21(gl_FragCoord.xy) - 0.5) * (1.5 / 255.0);
    col += filmGrain(gl_FragCoord.xy, uTime, uDpr) * uGrain;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

  function compileShader(gl, type, src) {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function initChessHorizon(canvas) {
    if (!canvas) return;

    const root = canvas.parentElement || canvas;
    const gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      depth: false,
      preserveDrawingBuffer: false
    });
    if (!gl) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    setupGeometry(gl, prog);
    const u = createUniformGetter(gl, prog);
    const props = readCanvasProps(canvas);
    startHorizonLoop(canvas, root, gl, u, props);
  }

  function setupGeometry(gl, prog) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  }

  function createUniformGetter(gl, prog) {
    return (name) => gl.getUniformLocation(prog, name);
  }

  function readCanvasProps(canvas) {
    return {
      background: canvas.dataset.bg || '#0D0C0A',
      baseColor: canvas.dataset.base || '#181612',
      accentColor: canvas.dataset.accent || '#F48F68',
      size: parseFloat(canvas.dataset.size) || 28,
      horizon: parseFloat(canvas.dataset.horizon) || 85,
      perspective: parseFloat(canvas.dataset.perspective) || 110,
      reach: parseFloat(canvas.dataset.reach) || 48,
      haze: parseFloat(canvas.dataset.haze) || 80,
      speed: parseFloat(canvas.dataset.speed) || 40,
      hover: 100,
      grain: 0
    };
  }

  function startHorizonLoop(canvas, root, gl, u, props) {
    const pointer = { rawX: 0.5, rawY: 0.5, on: 0, onTarget: 0 };
    setupHorizonPointer(root, pointer);

    let last = performance.now();
    let clock = 0;
    let pan = 0;
    let isVisible = true;

    setupHorizonIntersectionObserver(canvas, (vis) => { isVisible = vis; });

    function render(now) {
      requestAnimationFrame(render);
      if (!isVisible) {
        last = now;
        return;
      }

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock = (clock + dt) % 3600;
      pointer.on += (pointer.onTarget - pointer.on) * (1 - Math.exp(-HOVER_RATE * dt));

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const cssWidth = root.offsetWidth || canvas.clientWidth || 1200;
      const cssHeight = root.offsetHeight || canvas.clientHeight || 700;
      const bufferWidth = Math.max(1, Math.round(cssWidth * dpr));
      const bufferHeight = Math.max(1, Math.round(cssHeight * dpr));

      if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
        canvas.width = bufferWidth;
        canvas.height = bufferHeight;
        gl.viewport(0, 0, bufferWidth, bufferHeight);
      }
      const aspect = bufferWidth / bufferHeight;

      const square = clamp(num(props.size, 30), 5, 100) / 100;
      const horizon = clamp(num(props.horizon, 62), 30, 90) / 100;
      const fovDeg = clamp(num(props.perspective, 55), 10, 120);
      const focal = 0.5 / Math.tan((fovDeg * Math.PI) / 360);

      pan += (dt * (clamp(num(props.speed, 50), -100, 100) / 50) * SCROLL_RATE) / square;
      pan = pan % 2;
      if (pan < 0) pan += 2;

      const sxCursor = (pointer.rawX - 0.5) * aspect;
      const syCursor = 1 - pointer.rawY;
      const yyCursor = horizon - syCursor;
      let lampX = 0, lampZ = IDLE_Z;
      if (yyCursor > 1 / bufferHeight) {
        lampZ = (CAM_HEIGHT * focal) / yyCursor;
        lampX = (sxCursor * lampZ) / focal;
      } else {
        lampZ = 40;
        lampX = sxCursor * 40;
      }
      const follow = (clamp(num(props.hover, 100), 0, 100) / 100) * Math.min(1, pointer.on);

      setHorizonUniforms(gl, u, props, bufferWidth, bufferHeight, clock, dpr, horizon, focal, square, pan, lampX, lampZ, follow, pointer);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    requestAnimationFrame(render);
  }

  function setHorizonUniforms(gl, u, props, bufferWidth, bufferHeight, clock, dpr, horizon, focal, square, pan, lampX, lampZ, follow, pointer) {
    gl.uniform2f(u('uRes'), bufferWidth, bufferHeight);
    gl.uniform1f(u('uTime'), clock);
    gl.uniform1f(u('uDpr'), dpr);

    const bg = parseColor(props.background, [0.043, 0.051, 0.078]);
    const base = parseColor(props.baseColor, [0.055, 0.078, 0.125]);
    const accent = parseColor(props.accentColor, [0.831, 0.855, 0.898]);
    gl.uniform3f(u('uBg'), bg[0], bg[1], bg[2]);
    gl.uniform3f(u('uBase'), base[0], base[1], base[2]);
    gl.uniform3f(u('uAccent'), accent[0], accent[1], accent[2]);

    gl.uniform1f(u('uHorizon'), horizon);
    gl.uniform1f(u('uFocal'), focal);
    gl.uniform1f(u('uCamH'), CAM_HEIGHT);
    gl.uniform1f(u('uSquare'), square);
    gl.uniform1f(u('uPanZ'), pan);

    const lampWorldX = lampX * follow;
    const lampWorldZ = IDLE_Z + (lampZ - IDLE_Z) * follow;
    gl.uniform2f(u('uLamp'), lampWorldX, lampWorldZ);
    gl.uniform2f(u('uSelQ'), lampWorldX / square, lampWorldZ / square + pan);
    gl.uniform1f(u('uLampH'), (clamp(num(props.reach, 35), 5, 100) / 100) * 2.2);
    gl.uniform1f(u('uLampAmt'), Math.min(1, pointer.on));
    gl.uniform1f(u('uHaze'), (clamp(num(props.haze, 30), 0, 100) / 100) * 0.22);
    gl.uniform1f(u('uGrain'), (clamp(num(props.grain, 4), 0, 100) / 100) * 0.09);
  }

  function setupHorizonPointer(root, pointer) {
    const onMove = (event) => {
      const rect = root.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      pointer.rawX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      pointer.rawY = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      pointer.onTarget = 1;
    };
    const onLeave = () => { pointer.onTarget = 0; };

    root.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerenter', onMove, { passive: true });
    root.addEventListener('pointerleave', onLeave, { passive: true });
    window.addEventListener('blur', onLeave);
  }

  function setupHorizonIntersectionObserver(canvas, onVisibilityChange) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { onVisibilityChange(entry.isIntersecting); });
      }, { threshold: 0.05 });
      observer.observe(canvas);
    }
  }

  function init() {
    const canvases = document.querySelectorAll('canvas[data-chess-horizon], #chess-horizon-canvas');
    canvases.forEach((canvas) => initChessHorizon(canvas));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
