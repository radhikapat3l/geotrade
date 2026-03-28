# NEXCHAIN — Crypto Globe Intelligence

A cyberpunk-styled cryptocurrency market intelligence dashboard featuring an interactive 3D globe, live market data, AI signals panel, portfolio tracker, and market heatmap.

![NEXCHAIN Preview](https://raw.githubusercontent.com/your-username/nexchain/main/preview.png)

## Features

- **Interactive Crypto Globe** — Drag-to-rotate globe showing crypto activity by region with click-to-expand details
- **Live Market Ticker** — Real-time scrolling price ticker for all tracked coins
- **AI Signals Panel** — Buy/Sell/Hold signals with confidence scores, AI analysis, and risk factors
- **Markets Table** — Full sortable/filterable market table with sparkline charts
- **Market Heatmap** — Color-coded heatmap of all coins by 24h performance
- **Portfolio Tracker** — Add holdings and track P&L in real time
- **What-If Scenarios** — Interactive sliders to model market scenarios (Halving, Rate Change, Crash, Regulation)
- **Dominance Charts** — BTC/ETH/BNB dominance bars
- **Live News Ticker** — Scrolling crypto news feed
- **Crypto Fear Index (CFI)** — Live-updating sentiment index
- **UTC Clock** — Real-time clock display

## Tech Stack

Pure HTML + CSS + JavaScript (vanilla). No frameworks, no build tools required.

- **Canvas API** for the 3D globe renderer
- **Google Fonts** (Orbitron + Share Tech Mono)
- No external JS dependencies

## Getting Started

### Option 1 — Open directly
Just open `index.html` in any modern browser. No server required.

### Option 2 — Serve locally
```bash
# Python 3
python3 -m http.server 8080

# Node (npx)
npx serve .

# Then open http://localhost:8080
```

## Project Structure

```
nexchain-geo/
├── index.html        # Main HTML structure
├── css/
│   └── style.css     # Full cyberpunk stylesheet
├── js/
│   ├── data.js       # All coin, region, signal, and news data
│   ├── globe.js      # 2D Canvas globe renderer with drag-rotation
│   ├── ui.js         # All UI render functions
│   └── app.js        # App bootstrap + live price simulation
└── README.md
```

## Customisation

### Adding Coins
Edit the `COINS` array in `js/data.js`:
```javascript
{
  rank: 21,
  name: 'Sui',
  symbol: 'SUI',
  price: 1.84,
  change: 4.12,
  cap: 2.1,
  vol: 0.3,
  category: 'layer1',
  color: '#4DA2FF',
  prices7d: [1.6, 1.65, 1.7, 1.72, 1.78, 1.82, 1.84]
}
```

### Adding AI Signals
Edit the `AI_SIGNALS` array in `js/data.js`:
```javascript
{
  symbol: 'SUI', action: 'BUY', price: 1.84, change: 4.12,
  meta: 'Layer 1 / Move VM',
  confidence: 68, uncertainty: 20,
  aiText: 'Growing ecosystem TVL. Developer activity at all-time highs.',
  risks: ['Low liquidity', 'Vesting unlocks upcoming'],
}
```

### Connecting Real Data
Replace the simulation in `js/app.js` `liveUpdate()` with a real API call:
```javascript
// Example using CoinGecko free API
async function fetchPrices() {
  const ids = COINS.map(c => c.name.toLowerCase().replace(' ', '-')).join(',');
  const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
  const data = await res.json();
  // Map data back to COINS array...
}
```

## Disclaimer

This platform provides market data for informational purposes only. Nothing constitutes financial advice. Cryptocurrency investments carry significant risk.

## License

MIT — use freely, attribution appreciated.
