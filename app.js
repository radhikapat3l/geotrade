// ============================================================
//  app.js — Bootstrap, live simulation, orchestration
// ============================================================

let cfiValue = 68.2;
let cfiDelta = 1.4;
const cfiHistory = [58, 61, 63, 60, 65, 64, 66, 68, 67, 68.2];

function init() {
  // Clock
  updateClock();
  setInterval(updateClock, 1000);

  // CFI
  updateCFIDisplay(cfiValue, cfiDelta);

  // Globe
  const canvas = document.getElementById('globeCanvas');
  if (canvas) {
    Globe.init(canvas, (regionName, regionData) => {
      // On click — show region info in a notification or highlight
      showRegionBanner(regionName, regionData);
    });
  }

  // News ticker
  renderNewsTicker();

  // Signals panel
  renderFeaturedSignal(AI_SIGNALS[0]);
  renderSignalsList();

  // Mini heatmap
  renderMiniHeatmap();

  // Dominance bars
  renderDominance();

  // Trend dots
  renderTrendDots(cfiHistory);

  // Markets (preload)
  applyMarketFilters();

  // Live simulation
  setInterval(liveUpdate, 2800);

  // Make sure globe view is default
  switchView('globe', document.querySelector('[data-view="globe"]'));
}

// ── Region click banner ───────────────────────────────────────

function showRegionBanner(name, data) {
  // Remove any existing
  const old = document.getElementById('region-banner');
  if (old) old.remove();

  const banner = document.createElement('div');
  banner.id = 'region-banner';
  banner.style.cssText = `
    position: absolute;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(6,22,33,0.97);
    border: 1px solid ${data.color};
    padding: 14px 24px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px;
    color: #c0ddf0;
    display: flex;
    gap: 24px;
    align-items: center;
    white-space: nowrap;
    z-index: 200;
    box-shadow: 0 0 30px rgba(0,0,0,0.5);
    animation: fadeInUp 0.3s ease;
  `;

  banner.innerHTML = `
    <style>
      @keyframes fadeInUp {
        from { opacity:0; transform: translateX(-50%) translateY(10px); }
        to   { opacity:1; transform: translateX(-50%) translateY(0); }
      }
    </style>
    <span style="color:${data.color};font-family:'Orbitron',monospace;font-weight:700;font-size:13px;letter-spacing:1px">${data.label}</span>
    <span>Vol: <strong style="color:#fff">${data.volume}</strong></span>
    <span>Activity: <strong style="color:${data.color}">${data.activity}</strong></span>
    <span>Sentiment: <strong style="color:#ffee00">${data.sentiment}/100</strong></span>
    <span>Top: <strong style="color:#fff">${data.topCoins.join(', ')}</strong></span>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;color:#3a6a8a;cursor:pointer;font-size:14px;margin-left:8px">✕</button>
  `;

  const centerView = document.querySelector('.center-view');
  if (centerView) centerView.appendChild(banner);
  setTimeout(() => { if (banner.parentElement) banner.remove(); }, 6000);
}

// ── Live data simulation ──────────────────────────────────────

function liveUpdate() {
  // Simulate price drift
  COINS.forEach(c => {
    const drift = (Math.random() - 0.49) * 0.0012;
    c.price = Math.max(c.price * (1 + drift), 0.000001);
    const changeDrift = (Math.random() - 0.5) * 0.15;
    c.change = parseFloat((c.change + changeDrift).toFixed(2));
    // Keep within realistic bounds
    c.change = Math.max(-20, Math.min(30, c.change));
    // Update last price in 7d array for sparkline
    c.prices7d[c.prices7d.length - 1] = c.price;
  });

  // Simulate CFI drift
  cfiDelta = parseFloat(((Math.random() - 0.5) * 0.8).toFixed(1));
  cfiValue = Math.max(10, Math.min(95, cfiValue + cfiDelta));
  cfiHistory.push(cfiValue);
  if (cfiHistory.length > 20) cfiHistory.shift();

  updateCFIDisplay(cfiValue, cfiDelta);
  renderTrendDots(cfiHistory);
  renderMiniHeatmap();
  renderDominance();

  // Update featured signal price
  const featSig = AI_SIGNALS[0];
  const featCoin = COINS.find(c => c.symbol === featSig.symbol);
  if (featCoin) {
    featSig.price = featCoin.price;
    featSig.change = featCoin.change;
    renderFeaturedSignal(featSig);
  }

  // If markets view is active, re-render
  const marketsView = document.getElementById('marketsView');
  if (marketsView && !marketsView.classList.contains('hidden')) {
    applyMarketFilters();
  }

  // Update portfolio values
  const portfolioView = document.getElementById('portfolioView');
  if (portfolioView && !portfolioView.classList.contains('hidden') && portfolio.length > 0) {
    renderPortfolio();
  }
}

// ── Start ─────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', init);
