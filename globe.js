// ============================================================
//  globe.js — 2D Canvas Crypto Globe
//  Draws a rotating pseudo-3D globe with colored crypto regions
// ============================================================

const Globe = (() => {
  let canvas, ctx;
  let W, H, cx, cy, R;
  let rotX = 0.35;       // tilt
  let rotY = 0;          // spin
  let spinSpeed = 0.0015;
  let dragging = false;
  let lastMX = 0, lastMY = 0;
  let hoveredRegion = null;
  let onRegionClick = null;
  let popup = null;
  let animFrame = null;

  // Region "blobs" defined as lat/lon center + spread
  const REGION_BLOBS = {
    'N. America': { lat: 48,  lon: -100, latSpread: 22, lonSpread: 28, color: '#00c4ff' },
    'Europe':     { lat: 52,  lon:   15, latSpread: 15, lonSpread: 20, color: '#00ff9d' },
    'Asia Pac.':  { lat: 30,  lon:  100, latSpread: 30, lonSpread: 45, color: '#ffb800' },
    'Middle East':{ lat: 25,  lon:   45, latSpread: 12, lonSpread: 18, color: '#ff6b35' },
    'L. America': { lat: -15, lon:  -60, latSpread: 25, lonSpread: 20, color: '#b44fff' },
    'Africa':     { lat:   5, lon:   25, latSpread: 30, lonSpread: 22, color: '#ff3d6e' },
  };

  // lat/lon → unit sphere point
  function latlonToXYZ(lat, lon) {
    const phi   = (90 - lat)  * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return {
      x: Math.sin(phi) * Math.cos(theta),
      y: Math.cos(phi),
      z: Math.sin(phi) * Math.sin(theta),
    };
  }

  // Rotate point by rotX (pitch) and rotY (yaw)
  function rotatePoint({ x, y, z }) {
    // Yaw (around Y axis)
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    let x1 = x * cosY - z * sinY;
    let z1 = x * sinY + z * cosY;
    // Pitch (around X axis)
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    let y2 = y * cosX - z1 * sinX;
    let z2 = y * sinX + z1 * cosX;
    return { x: x1, y: y2, z: z2 };
  }

  // Project to canvas coords
  function project(pt) {
    return {
      x: cx + pt.x * R,
      y: cy - pt.y * R,
      visible: pt.z > 0,
    };
  }

  // Generate fill points for a region blob on the globe surface
  function blobPoints(blob, steps = 18) {
    const pts = [];
    const { lat, lon, latSpread, lonSpread } = blob;
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * 2 * Math.PI;
      const dlat = Math.cos(angle) * latSpread;
      const dlon = Math.sin(angle) * lonSpread;
      pts.push(latlonToXYZ(lat + dlat, lon + dlon));
    }
    return pts;
  }

  // Draw a single frame
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // ── Background glow behind globe ──
    const glow = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.4);
    glow.addColorStop(0, 'rgba(0,30,50,0.0)');
    glow.addColorStop(0.8, 'rgba(0,245,255,0.04)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.4, 0, Math.PI * 2);
    ctx.fill();

    // ── Draw globe sphere ──
    const sphereGrad = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.2, R * 0.05, cx, cy, R);
    sphereGrad.addColorStop(0, '#0c2233');
    sphereGrad.addColorStop(0.5, '#05121e');
    sphereGrad.addColorStop(1, '#020a12');
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = sphereGrad;
    ctx.fill();

    // ── Globe outer glow ──
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,245,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ── Atmosphere ──
    const atmo = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.08);
    atmo.addColorStop(0, 'rgba(0,245,255,0.0)');
    atmo.addColorStop(0.5, 'rgba(0,245,255,0.04)');
    atmo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.08, 0, Math.PI * 2);
    ctx.fillStyle = atmo;
    ctx.fill();

    // ── Clip to sphere for all globe content ──
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R - 1, 0, Math.PI * 2);
    ctx.clip();

    // ── Latitude/longitude grid ──
    ctx.strokeStyle = 'rgba(0,245,255,0.05)';
    ctx.lineWidth = 0.5;
    const latLines = 9, lonLines = 18;
    for (let i = 1; i < latLines; i++) {
      const lat = -90 + i * (180 / latLines);
      drawLatLine(lat);
    }
    for (let i = 0; i < lonLines; i++) {
      const lon = -180 + i * (360 / lonLines);
      drawLonLine(lon);
    }

    // ── Region blobs ──
    for (const [name, blob] of Object.entries(REGION_BLOBS)) {
      drawRegion(name, blob);
    }

    // ── Stars / dots on dark side ──
    drawOceanDots();

    ctx.restore();

    // ── Glare highlight ──
    const glare = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.32, 0, cx - R * 0.3, cy - R * 0.32, R * 0.55);
    glare.addColorStop(0, 'rgba(255,255,255,0.07)');
    glare.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = glare;
    ctx.fill();

    // ── Orbital ring ──
    drawOrbitalRing();

    // ── Popup ──
    if (popup) drawPopup();
  }

  function drawLatLine(lat) {
    const steps = 60;
    let started = false;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const lon = -180 + i * (360 / steps);
      const raw = latlonToXYZ(lat, lon);
      const rot = rotatePoint(raw);
      const p   = project(rot);
      if (!p.visible) { started = false; continue; }
      if (!started) { ctx.moveTo(p.x, p.y); started = true; }
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  function drawLonLine(lon) {
    const steps = 40;
    let started = false;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const lat = -90 + i * (180 / steps);
      const raw = latlonToXYZ(lat, lon);
      const rot = rotatePoint(raw);
      const p   = project(rot);
      if (!p.visible) { started = false; continue; }
      if (!started) { ctx.moveTo(p.x, p.y); started = true; }
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  function drawRegion(name, blob) {
    const pts = blobPoints(blob);
    const projected = pts.map(p => { const r = rotatePoint(p); return { ...project(r), vis: r.z > -0.1 }; });
    const visible = projected.filter(p => p.visible || p.vis);
    if (visible.length < 3) return;

    const hovered = hoveredRegion === name;
    const alpha = hovered ? 0.75 : 0.45;

    ctx.beginPath();
    let started = false;
    for (const p of projected) {
      if (!p.visible) { started = false; continue; }
      if (!started) { ctx.moveTo(p.x, p.y); started = true; }
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fillStyle = hexToRgba(blob.color, alpha);
    ctx.fill();

    // Border
    ctx.strokeStyle = hexToRgba(blob.color, hovered ? 0.9 : 0.5);
    ctx.lineWidth = hovered ? 1.5 : 0.8;
    ctx.stroke();

    // Label (center point)
    const centerRaw = latlonToXYZ(blob.lat, blob.lon);
    const centerRot = rotatePoint(centerRaw);
    if (centerRot.z > 0.1) {
      const p = project(centerRot);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = `bold ${Math.round(R * 0.045)}px 'Share Tech Mono'`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, p.x, p.y);
    }
  }

  function drawOceanDots() {
    // Small particle dots scattered over ocean areas
    const seed = 42;
    for (let i = 0; i < 120; i++) {
      const lat = pseudoRand(seed + i * 7.3) * 160 - 80;
      const lon = pseudoRand(seed + i * 13.7) * 360 - 180;
      const raw = latlonToXYZ(lat, lon);
      const rot = rotatePoint(raw);
      if (rot.z < 0.2) continue;
      const p = project(rot);
      const alpha = (rot.z - 0.2) * 0.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,245,255,${alpha.toFixed(2)})`;
      ctx.fill();
    }
  }

  function drawOrbitalRing() {
    const tilt = rotX * 0.5;
    const a = R * 1.22;
    const b = R * 0.18;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-tilt * 0.3);
    ctx.beginPath();
    ctx.ellipse(0, 0, a, b, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,245,255,0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dot on ring representing "current position"
    const dotAngle = rotY * 2;
    const dx = Math.cos(dotAngle) * a;
    const dy = Math.sin(dotAngle) * b;
    ctx.beginPath();
    ctx.arc(dx, dy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#00f5ff';
    ctx.shadowColor = '#00f5ff';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  function drawPopup() {
    if (!popup) return;
    const { x, y, data } = popup;
    const pw = 200, ph = 140;
    let px = Math.min(x + 12, W - pw - 10);
    let py = Math.max(y - ph / 2, 10);

    ctx.fillStyle = 'rgba(6,22,33,0.96)';
    ctx.strokeStyle = 'rgba(0,245,255,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 2);
    ctx.fill();
    ctx.stroke();

    // Top accent line
    ctx.fillStyle = data.color;
    ctx.fillRect(px, py, pw, 2);

    ctx.fillStyle = data.color;
    ctx.font = `bold 12px 'Orbitron'`;
    ctx.textAlign = 'left';
    ctx.fillText(data.label, px + 12, py + 20);

    ctx.fillStyle = '#7aaccc';
    ctx.font = `11px 'Share Tech Mono'`;
    const rows = [
      ['Activity:', data.activity],
      ['Volume:', data.volume],
      ['Sentiment:', data.sentiment + ' / 100'],
      ['Top coins:', data.topCoins.join(', ')],
    ];
    rows.forEach(([label, val], i) => {
      ctx.fillStyle = '#3a6a8a';
      ctx.fillText(label, px + 12, py + 42 + i * 22);
      ctx.fillStyle = '#c0ddf0';
      ctx.fillText(val, px + 85, py + 42 + i * 22);
    });
  }

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function pseudoRand(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // Hit-test: is canvas point inside a region blob?
  function regionAtPoint(mx, my) {
    for (const [name, blob] of Object.entries(REGION_BLOBS)) {
      const pts = blobPoints(blob, 24);
      const projected = pts.map(p => {
        const r = rotatePoint(p);
        return project(r);
      }).filter(p => p.visible);
      if (projected.length < 3) continue;
      if (pointInPolygon(mx, my, projected)) return name;
    }
    return null;
  }

  function pointInPolygon(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x, yi = poly[i].y;
      const xj = poly[j].x, yj = poly[j].y;
      const intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function resize() {
    const wrap = canvas.parentElement;
    W = wrap.clientWidth;
    H = wrap.clientHeight;
    canvas.width  = W;
    canvas.height = H;
    cx = W / 2;
    cy = H / 2;
    R  = Math.min(W, H) * 0.42;
  }

  function tick() {
    if (!dragging) rotY += spinSpeed;
    draw();
    animFrame = requestAnimationFrame(tick);
  }

  function init(canvasEl, clickCallback) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    onRegionClick = clickCallback;
    resize();
    window.addEventListener('resize', () => { resize(); });

    // Drag to rotate
    canvas.addEventListener('mousedown', e => {
      dragging = true;
      lastMX = e.clientX;
      lastMY = e.clientY;
    });
    window.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (dragging) {
        const dx = e.clientX - lastMX;
        const dy = e.clientY - lastMY;
        rotY += dx * 0.005;
        rotX += dy * 0.003;
        rotX = Math.max(-1.2, Math.min(1.2, rotX));
        lastMX = e.clientX;
        lastMY = e.clientY;
        hoveredRegion = null;
        popup = null;
      } else {
        const hit = regionAtPoint(mx, my);
        hoveredRegion = hit;
        if (hit) {
          canvas.style.cursor = 'pointer';
          popup = { x: mx, y: my, data: REGIONS[hit] };
        } else {
          canvas.style.cursor = 'crosshair';
          popup = null;
        }
      }
    });
    window.addEventListener('mouseup', () => { dragging = false; });

    canvas.addEventListener('click', e => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const hit = regionAtPoint(mx, my);
      if (hit && onRegionClick) onRegionClick(hit, REGIONS[hit]);
    });

    // Touch support
    canvas.addEventListener('touchstart', e => {
      dragging = true;
      lastMX = e.touches[0].clientX;
      lastMY = e.touches[0].clientY;
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchmove', e => {
      const dx = e.touches[0].clientX - lastMX;
      const dy = e.touches[0].clientY - lastMY;
      rotY += dx * 0.005;
      rotX += dy * 0.003;
      rotX = Math.max(-1.2, Math.min(1.2, rotX));
      lastMX = e.touches[0].clientX;
      lastMY = e.touches[0].clientY;
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchend', () => { dragging = false; });

    tick();
  }

  function destroy() {
    if (animFrame) cancelAnimationFrame(animFrame);
  }

  return { init, destroy };
})();
