/**
 * ASCII Reveal — Originkit (Vanilla JS Edition)
 * Converts an image into high-contrast ASCII matrix characters and
 * dynamically reveals the high-res photo underneath with a fluid cursor lens.
 */

(function () {
  'use strict';

  const DEFAULTS = {
    fit: 'cover',
    focusY: 50,
    columns: 180,
    ramp: ' .:-=+*#%@',
    invert: false,
    contrast: 100,
    colorMode: 'mono',
    inkColor: '#FFF6DE',
    reveal: true,
    revealSize: 85,
    revealSoftness: 18,
  };

  const contrastAt = (value) => 0.5 + (value / 100) * 2;
  const clampFocus = (value) => Math.min(100, Math.max(0, typeof value === 'number' ? value : 50));

  function placeRect(imgW, imgH, boxW, boxH, fit, focusY) {
    const scale = fit === 'contain'
      ? Math.min(boxW / imgW, boxH / imgH)
      : Math.max(boxW / imgW, boxH / imgH);
    const dw = imgW * scale;
    const dh = imgH * scale;
    const f = fit === 'cover' ? clampFocus(focusY) / 100 : 0.5;
    return { dx: (boxW - dw) / 2, dy: (boxH - dh) * f, dw, dh };
  }

  function initAsciiReveal(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const src = canvas.dataset.src || 'Assets/Extra assets/1772188637576.png';
    const columns = parseInt(canvas.dataset.columns, 10) || DEFAULTS.columns;
    const ramp = canvas.dataset.ramp || DEFAULTS.ramp;
    const contrast = parseFloat(canvas.dataset.contrast) || DEFAULTS.contrast;
    const inkColor = canvas.dataset.ink || DEFAULTS.inkColor;
    const colorMode = canvas.dataset.colorMode || DEFAULTS.colorMode;
    const revealSize = parseFloat(canvas.dataset.revealSize) || DEFAULTS.revealSize;
    const revealSoftness = parseFloat(canvas.dataset.revealSoftness) || DEFAULTS.revealSoftness;
    const fit = canvas.dataset.fit || DEFAULTS.fit;
    const focusY = parseFloat(canvas.dataset.focusY) || DEFAULTS.focusY;
    const invert = canvas.dataset.invert === 'true';
    const reveal = canvas.dataset.reveal !== 'false';

    const punch = contrastAt(contrast);
    const pointer = { x: -9999, y: -9999, inside: false };
    const BLOB_COUNT = 5;
    const blobs = Array.from({ length: BLOB_COUNT }, () => ({ x: 0, y: 0 }));
    let seeded = false;

    let sampler = document.createElement('canvas');
    let off = document.createElement('canvas');
    let revealCanvas = document.createElement('canvas');
    let maskCanvas = document.createElement('canvas');
    let coverRect = { dx: 0, dy: 0, dw: 0, dh: 0 };

    let isVisible = true;
    let raf = 0;
    let alive = true;

    function getSize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 600;
      const h = canvas.clientHeight || canvas.parentElement?.clientHeight || 600;
      return { w, h, dpr };
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    function buildAscii() {
      if (!img.complete || img.naturalWidth === 0) return;

      const { w, h, dpr } = getSize();
      const bufferW = Math.max(1, Math.round(w * dpr));
      const bufferH = Math.max(1, Math.round(h * dpr));

      if (canvas.width !== bufferW || canvas.height !== bufferH) {
        canvas.width = bufferW;
        canvas.height = bufferH;
      }

      const cols = Math.max(8, Math.round(columns));
      const cellW = bufferW / cols;
      const fontPx = cellW * 1.7;
      const cellH = fontPx;
      const rows = Math.max(1, Math.floor(bufferH / cellH));

      sampler.width = cols;
      sampler.height = rows;
      const sctx = sampler.getContext('2d', { willReadFrequently: true });
      if (!sctx) return;

      const place = placeRect(img.width, img.height, bufferW, bufferH, fit, focusY);
      sctx.clearRect(0, 0, cols, rows);
      sctx.drawImage(img, place.dx / cellW, place.dy / cellH, place.dw / cellW, place.dh / cellH);

      let data;
      try {
        data = sctx.getImageData(0, 0, cols, rows).data;
      } catch (e) {
        return;
      }

      off.width = bufferW;
      off.height = bufferH;
      const octx = off.getContext('2d');
      if (!octx) return;

      octx.clearRect(0, 0, off.width, off.height);
      octx.font = fontPx.toFixed(2) + 'px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      octx.textBaseline = 'top';

      const last = ramp.length - 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = (r * cols + c) * 4;
          const rr = data[i];
          const gg = data[i + 1];
          const bb = data[i + 2];
          let lum = (0.299 * rr + 0.587 * gg + 0.114 * bb) / 255;
          lum = (lum - 0.5) * punch + 0.5;
          if (invert) lum = 1 - lum;
          lum = lum < 0 ? 0 : lum > 1 ? 1 : lum;
          const ch = ramp[Math.round(lum * last)];
          if (ch === ' ') continue;

          octx.fillStyle = colorMode === 'image'
            ? `rgb(${Math.min(255, rr + 30)}, ${Math.min(255, gg + 30)}, ${Math.min(255, bb + 30)})`
            : inkColor;
          octx.fillText(ch, c * cellW, r * cellH);
        }
      }

      coverRect = place;
    }

    function ensureLayer(layer) {
      if (layer.width !== canvas.width || layer.height !== canvas.height) {
        layer.width = canvas.width;
        layer.height = canvas.height;
      }
      return layer;
    }

    function updateBlobs() {
      if (blobs.length === 0) return;
      const { dpr } = getSize();
      const tx = pointer.x * dpr;
      const ty = pointer.y * dpr;
      if (!seeded) {
        for (const blob of blobs) {
          blob.x = tx;
          blob.y = ty;
        }
        seeded = true;
        return;
      }
      blobs[0].x += (tx - blobs[0].x) * 0.35;
      blobs[0].y += (ty - blobs[0].y) * 0.35;
      for (let i = 1; i < blobs.length; i++) {
        blobs[i].x += (blobs[i - 1].x - blobs[i].x) * 0.35;
        blobs[i].y += (blobs[i - 1].y - blobs[i].y) * 0.35;
      }
    }

    function paint() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(off, 0, 0);

      if (!reveal || !pointer.inside || !img.complete || img.naturalWidth === 0) return;

      const { dpr } = getSize();
      const photo = ensureLayer(revealCanvas);
      const pctx = photo.getContext('2d');
      const mask = ensureLayer(maskCanvas);
      const mctx = mask.getContext('2d');
      if (!pctx || !mctx) return;

      pctx.globalCompositeOperation = 'source-over';
      pctx.clearRect(0, 0, photo.width, photo.height);
      pctx.drawImage(img, coverRect.dx, coverRect.dy, coverRect.dw, coverRect.dh);

      mctx.clearRect(0, 0, mask.width, mask.height);
      mctx.save();
      mctx.filter = `blur(${(revealSoftness * dpr).toFixed(1)}px)`;
      mctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < blobs.length; i++) {
        const t = blobs.length <= 1 ? 0 : i / (blobs.length - 1);
        const radius = revealSize * dpr * (1 - t * 0.5);
        mctx.beginPath();
        mctx.arc(blobs[i].x, blobs[i].y, radius, 0, Math.PI * 2);
        mctx.fill();
      }
      mctx.restore();

      pctx.globalCompositeOperation = 'destination-in';
      pctx.drawImage(mask, 0, 0);
      pctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(photo, 0, 0);
    }

    function loop() {
      if (!alive) return;
      if (isVisible) {
        updateBlobs();
        paint();
      }
      raf = requestAnimationFrame(loop);
    }

    function onMove(event) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      pointer.x = x;
      pointer.y = y;
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
    }

    function onLeave() {
      pointer.inside = false;
      seeded = false;
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      }, { threshold: 0.05 });
      observer.observe(canvas);
    }

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        buildAscii();
        paint();
      });
      ro.observe(canvas);
    }

    canvas.addEventListener('pointermove', onMove, { passive: true });
    canvas.addEventListener('pointerleave', onLeave);
    canvas.style.cursor = 'crosshair';

    img.onload = () => {
      if (!alive) return;
      buildAscii();
      paint();
      if (reveal) raf = requestAnimationFrame(loop);
    };
    img.src = src;
  }

  function init() {
    const canvases = document.querySelectorAll('canvas[data-ascii-reveal], #ascii-reveal-canvas');
    canvases.forEach((canvas) => initAsciiReveal(canvas));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
