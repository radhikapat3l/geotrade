// ============================================================
//  ui.js — All UI render functions for NEXCHAIN
// ============================================================

// ── Helpers ──────────────────────────────────────────────────

function fmtPrice(p) {
  if (p >= 10000)  return '$' + p.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (p >= 1000)   return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1)      return '$' + p.toFixed(3);
  if (p >= 0.01)   return '$' + p.toFixed(4);
  return '$' + p.toFixed(8);
}

function fmtCap(n) {
  if (n >= 1000) return '$' + (n / 1000).toFixed(2) + 'T';
  if (n >= 1)    return '$' + n.toFixed(1) + 'B';
  return '$' + n.toFixed(2) + 'B';
}

function sparkSVG(prices, up) {
  const w = 80, h = 32;
  const min = Math.min(...prices), max = Math.max(...prices);
  const range = max - min || 1;
  const pts = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * w;
    const y = h - ((p - min) / range) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const color = up ? '#00ff88' : '#ff003c';
  return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.9"/>
    <circle cx="${pts[pts.length-1].split(',')[0]}" cy="${pts[pts.length-1].split(',')[1]}" r="2.5" fill="${color}"/>
  </svg>`;
}

// ── Clock ─────────────────────────────────────────────────────

function updateClock() {
  const d = new Date();
  const h = d.getUTCHours()   .toString().padStart(2,'0');
  const m = d.getUTCMinutes() .toString().padStart(2,'0');
  const s = d.getUTCSeconds() .toString().padStart(2,'0');
  const el = document.getElementById('utc-clock');
  if (el) el.textContent = `${h}:${m}:${s} UTC`;
}

// ── CFI Display ───────────────────────────────────────────────

function updateCFIDisplay(cfi, delta) {
  const valEl   = document.getElementById('cfi-value');
  const deltaEl = document.getElementById('cfi-delta');
  const badgeEl = document.getElementById('cfi-badge');
  const globeEl = document.getElementById('globe-cfi');
  const btEl    = document.getElementById('bt-cfi');

  if (valEl)   valEl.textContent   = cfi.toFixed(1);
  if (globeEl) globeEl.textContent = cfi.toFixed(1);
  if (btEl)    btEl.textContent    = cfi.toFixed(1);

  if (deltaEl) {
    deltaEl.textContent = (delta >= 0 ? '▲+' : '▼') + delta.toFixed(1);
    deltaEl.className = 'cfi-delta ' + (delta >= 0 ? 'up' : 'down');
  }

  const level = cfi < 25 ? 'EXTREME FEAR'
    : cfi < 45 ? 'FEAR'
    : cfi < 55 ? 'NEUTRAL'
    : cfi < 75 ? 'GREED'
    : 'EXTREME GREED';
  if (badgeEl) badgeEl.textContent = level;
}

// ── Trend dots ────────────────────────────────────────────────

function renderTrendDots(history) {
  const el = document.getElementById('trend-dots');
  if (!el) return;
  const recent = history.slice(-10);
  const max = Math.max(...recent), min = Math.min(...recent), range = max - min || 1;
  el.innerHTML = recent.map(v => {
    const pct = (v - min) / range;
    const cls = pct > 0.66 ? 'high' : pct > 0.33 ? 'med' : 'low';
    return `<div class="trend-dot ${cls}" title="${v.toFixed(1)}"></div>`;
  }).join('');
}

// ── News Ticker ───────────────────────────────────────────────

function renderNewsTicker() {
  const el = document.getElementById('news-ticker');
  if (!el) return;
  const iconMap = { critical: '⚠', high: '◎', medium: '●' };
  el.innerHTML = [...NEWS_ITEMS, ...NEWS_ITEMS].map(n => `
    <span class="news-item">
      <span class="news-icon ${n.severity}">${iconMap[n.severity]}</span>
      <span class="news-time">${n.time}</span>
      <span class="news-text">${n.text}</span>
      <span class="news-region">${n.region}</span>
    </span>
  `).join('');
}

// ── Signals Panel ────────────────────────────────────────────

function renderFeaturedSignal(sig) {
  const up = sig.change >= 0;
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  set('fs-sym', sig.symbol);
  set('fs-price', fmtPrice(sig.price));
  set('fs-meta', sig.meta);
  set('fs-conf', sig.confidence + '%');
  set('fs-unc', sig.uncertainty + '%');
  set('fs-ai-text', sig.aiText);

  const actionEl = document.getElementById('fs-action');
  if (actionEl) {
    actionEl.textContent = sig.action;
    actionEl.className = 'signal-action ' + sig.action.toLowerCase();
  }

  const changeEl = document.getElementById('fs-change');
  if (changeEl) {
    changeEl.textContent = (up ? '+' : '') + sig.change.toFixed(2) + '%';
    changeEl.className = 'signal-change ' + (up ? 'up' : 'down');
  }

  const confFill = document.getElementById('fs-conf-fill');
  const uncFill  = document.getElementById('fs-unc-fill');
  if (confFill) confFill.style.width = sig.confidence + '%';
  if (uncFill)  uncFill.style.width  = sig.uncertainty + '%';

  const risksEl = document.getElementById('fs-risks');
  if (risksEl) {
    risksEl.innerHTML = sig.risks.map(r => `<div class="risk-item">${r}</div>`).join('');
  }
}

function renderSignalsList() {
  const el = document.getElementById('signals-list');
  const countEl = document.getElementById('signal-count');
  if (!el) return;

  if (countEl) countEl.textContent = AI_SIGNALS.length;

  el.innerHTML = AI_SIGNALS.map(sig => {
    const up = sig.change >= 0;
    const color = sig.action === 'BUY' ? '#00ff88' : sig.action === 'SELL' ? '#ff003c' : '#ffee00';
    const fill = sig.action === 'BUY' ? sig.confidence : 100 - sig.confidence;
    return `<div class="signal-row" onclick="selectSignal('${sig.symbol}')">
      <span class="sr-sym">${sig.symbol}</span>
      <span class="sr-action signal-action ${sig.action.toLowerCase()}">${sig.action}</span>
      <div class="sr-info">
        <div class="sr-cat">${sig.meta}</div>
        <div class="sr-bar"><div class="sr-bar-fill" style="width:${fill}%;background:${color}"></div></div>
      </div>
      <span class="sr-price">${fmtPrice(sig.price)}</span>
      <span class="sr-chg ${up ? 'up' : 'down'}">${up ? '+' : ''}${sig.change.toFixed(2)}%</span>
    </div>`;
  }).join('');
}

function selectSignal(symbol) {
  const sig = AI_SIGNALS.find(s => s.symbol === symbol);
  if (sig) renderFeaturedSignal(sig);
}

// ── Mini Heatmap ─────────────────────────────────────────────

function renderMiniHeatmap() {
  const el = document.getElementById('mini-heatmap');
  if (!el) return;
  const top15 = COINS.slice(0, 15);
  el.innerHTML = top15.map(c => {
    const bg = heatColor(c.change);
    const up = c.change >= 0;
    return `<div class="mhm-cell" style="background:${bg}" title="${c.name}: ${c.change > 0 ? '+' : ''}${c.change.toFixed(2)}%">
      <span class="mhm-sym">${c.symbol}</span>
      <span class="mhm-chg">${up ? '+' : ''}${c.change.toFixed(1)}%</span>
    </div>`;
  }).join('');
}

function heatColor(change) {
  const a = Math.abs(change);
  if (change > 0) {
    if (a > 8)  return '#004d00';
    if (a > 4)  return '#006600';
    if (a > 1)  return '#1a5c1a';
    return '#1a3d1a';
  } else {
    if (a > 8)  return '#660000';
    if (a > 4)  return '#7a0000';
    if (a > 1)  return '#5c1a1a';
    return '#3d1a1a';
  }
}

// ── Dominance Bars ───────────────────────────────────────────

function renderDominance() {
  const el = document.getElementById('dominance-bars');
  if (!el) return;
  const totalCap = COINS.reduce((sum, c) => sum + c.cap, 0);
  const topCoins = COINS.slice(0, 5);
  const colors = { BTC: '#F7931A', ETH: '#627EEA', BNB: '#F0B90B', SOL: '#9945FF', XRP: '#00AAE4' };
  el.innerHTML = topCoins.map(c => {
    const pct = ((c.cap / totalCap) * 100).toFixed(1);
    return `<div class="dom-item">
      <div class="dom-row">
        <span>${c.symbol}</span>
        <span>${pct}%</span>
      </div>
      <div class="dom-bar-bg">
        <div class="dom-bar-fill" style="width:${pct}%;background:${colors[c.symbol] || '#00f5ff'}"></div>
      </div>
    </div>`;
  }).join('');
}

// ── Markets Table ─────────────────────────────────────────────

let _marketFilter = 'all';
let _marketSearch = '';
let _allMarketCoins = [...COINS];

function renderMarketsTable(coins) {
  const tbody = document.getElementById('markets-tbody');
  if (!tbody) return;
  tbody.innerHTML = coins.map(c => {
    const up = c.change >= 0;
    const maxVol = Math.max(...COINS.map(x => x.vol));
    const volPct = ((c.vol / maxVol) * 100).toFixed(0);
    return `<tr onclick="selectSignalFromMarket('${c.symbol}')">
      <td style="color:#3a6a8a">${c.rank}</td>
      <td>
        <div class="coin-cell">
          <div class="coin-avatar" style="background:${c.color}22;color:${c.color}">${c.symbol.slice(0,3)}</div>
          <div class="coin-name-col">
            <span class="cn">${c.name}</span>
            <span class="cs">${c.symbol}</span>
          </div>
        </div>
      </td>
      <td style="font-weight:500">${fmtPrice(c.price)}</td>
      <td><span class="${up ? 'badge-up' : 'badge-down'}">${up ? '▲' : '▼'} ${Math.abs(c.change).toFixed(2)}%</span></td>
      <td>${fmtCap(c.cap)}</td>
      <td style="color:#3a6a8a">${fmtCap(c.vol)}</td>
      <td>${sparkSVG(c.prices7d, up)}</td>
    </tr>`;
  }).join('');
}

function filterMarket(cat, btn) {
  _marketFilter = cat;
  document.querySelectorAll('.mf-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  applyMarketFilters();
}

function searchMarket(q) {
  _marketSearch = q.toLowerCase();
  applyMarketFilters();
}

function applyMarketFilters() {
  const filtered = COINS.filter(c => {
    const matchCat = _marketFilter === 'all' || c.category === _marketFilter;
    const matchQ   = !_marketSearch || c.name.toLowerCase().includes(_marketSearch) || c.symbol.toLowerCase().includes(_marketSearch);
    return matchCat && matchQ;
  });
  renderMarketsTable(filtered);
}

function selectSignalFromMarket(symbol) {
  const sig = AI_SIGNALS.find(s => s.symbol === symbol);
  if (sig) {
    switchView('signals', document.querySelector('[data-view="signals"]'));
    setTimeout(() => renderFeaturedSignal(sig), 50);
  }
}

// ── Portfolio ─────────────────────────────────────────────────

let portfolio = [];

function renderPortfolio() {
  const grid = document.getElementById('portfolio-grid');
  const totalEl = document.getElementById('pf-total');
  const changeEl = document.getElementById('pf-change');
  if (!grid) return;

  if (portfolio.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;font-family:'Share Tech Mono',monospace;font-size:13px;color:#3a6a8a">
      No assets tracked yet. Click "Add Asset" to start.
    </div>`;
    if (totalEl) totalEl.textContent = '$0.00';
    if (changeEl) { changeEl.textContent = '+$0.00 (0.00%)'; changeEl.className = 'pf-change up'; }
    return;
  }

  let totalValue = 0, totalCost = 0;
  portfolio.forEach(p => {
    const coin = COINS.find(c => c.symbol === p.symbol);
    if (!coin) return;
    const val = coin.price * p.amount;
    const cost = p.buyPrice * p.amount;
    totalValue += val;
    totalCost += cost;
  });

  const totalPnl = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  if (totalEl) totalEl.textContent = '$' + totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (changeEl) {
    const up = totalPnl >= 0;
    changeEl.textContent = `${up ? '+' : ''}$${Math.abs(totalPnl).toFixed(2)} (${up ? '+' : ''}${pnlPct.toFixed(2)}%)`;
    changeEl.className = 'pf-change ' + (up ? 'up' : 'down');
  }

  grid.innerHTML = portfolio.map((p, idx) => {
    const coin = COINS.find(c => c.symbol === p.symbol);
    if (!coin) return '';
    const value = coin.price * p.amount;
    const cost  = p.buyPrice * p.amount;
    const pnl   = value - cost;
    const pnlP  = cost > 0 ? (pnl / cost * 100) : 0;
    const up = pnl >= 0;
    return `<div class="portfolio-card" style="--coin-color:${coin.color}">
      <div class="pc-header">
        <span class="pc-sym" style="color:${coin.color}">${coin.symbol}</span>
        <button class="pc-remove" onclick="removeFromPortfolio(${idx})">✕</button>
      </div>
      <div class="pc-price">${fmtPrice(coin.price)}</div>
      <div class="pc-meta">${coin.name} · ${coin.category}</div>
      <div class="pc-row"><span class="label">Holdings</span><span class="value">${p.amount} ${coin.symbol}</span></div>
      <div class="pc-row"><span class="label">Value</span><span class="value">$${value.toFixed(2)}</span></div>
      <div class="pc-row"><span class="label">Avg buy</span><span class="value">${fmtPrice(p.buyPrice)}</span></div>
      <div class="pc-row"><span class="label">P&L</span><span class="value ${up ? 'up' : 'down'}">${up ? '+' : ''}$${pnl.toFixed(2)} (${up ? '+' : ''}${pnlP.toFixed(1)}%)</span></div>
    </div>`;
  }).join('');
}

function showAddCoin() {
  const modal = document.getElementById('addCoinModal');
  const sel = document.getElementById('modal-coin-select');
  if (!modal || !sel) return;
  sel.innerHTML = COINS.map(c => `<option value="${c.symbol}">${c.symbol} — ${c.name}</option>`).join('');
  modal.classList.remove('hidden');
}

function hideAddCoin() {
  const modal = document.getElementById('addCoinModal');
  if (modal) modal.classList.add('hidden');
}

function addCoinToPortfolio() {
  const sym      = document.getElementById('modal-coin-select').value;
  const amount   = parseFloat(document.getElementById('modal-amount').value) || 0;
  const buyPrice = parseFloat(document.getElementById('modal-buyprice').value) || 0;
  if (!sym || amount <= 0) return;
  portfolio.push({ symbol: sym, amount, buyPrice });
  hideAddCoin();
  renderPortfolio();
  document.getElementById('modal-amount').value = '';
  document.getElementById('modal-buyprice').value = '';
}

function removeFromPortfolio(idx) {
  portfolio.splice(idx, 1);
  renderPortfolio();
}

// ── Scenario sliders ─────────────────────────────────────────

function updateScenario(key, val) {
  const id = 'sv-' + key;
  const el = document.getElementById(id);
  if (!el) return;
  const v = parseInt(val);
  el.textContent = (v >= 0 ? '+' : '') + v + '%';
  el.style.color = v > 0 ? 'var(--neon-green)' : v < 0 ? 'var(--neon-pink)' : 'var(--text-bright)';
}

// ── Filter chips ──────────────────────────────────────────────

function toggleChip(btn, group) {
  btn.classList.toggle('active');
}

// ── View switching ────────────────────────────────────────────

function switchView(view, btn) {
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const globeWrap   = document.getElementById('globeWrap');
  const marketsView = document.getElementById('marketsView');
  const portfolioView = document.getElementById('portfolioView');

  [globeWrap, marketsView, portfolioView].forEach(el => el && el.classList.add('hidden'));

  if (view === 'globe') {
    globeWrap && globeWrap.classList.remove('hidden');
  } else if (view === 'markets') {
    marketsView && marketsView.classList.remove('hidden');
    applyMarketFilters();
  } else if (view === 'portfolio') {
    portfolioView && portfolioView.classList.remove('hidden');
    renderPortfolio();
  } else if (view === 'signals') {
    globeWrap && globeWrap.classList.remove('hidden');
    renderFeaturedSignal(AI_SIGNALS[0]);
  }
}

function togglePanel(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('collapsed');
}
