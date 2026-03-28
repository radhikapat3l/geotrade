// ============================================================
//  data.js — All static data for NEXCHAIN
// ============================================================

const COINS = [
  { rank:1,  name:'Bitcoin',      symbol:'BTC',  price:67420,      change:2.34,  cap:1320, vol:28.4, category:'layer1',     color:'#F7931A', prices7d:[61000,62500,63200,65000,64300,66100,67420] },
  { rank:2,  name:'Ethereum',     symbol:'ETH',  price:3542,       change:-1.12, cap:425,  vol:14.2, category:'layer1',     color:'#627EEA', prices7d:[3200,3350,3400,3600,3520,3580,3542] },
  { rank:3,  name:'BNB',          symbol:'BNB',  price:598,        change:0.87,  cap:87,   vol:2.1,  category:'layer1',     color:'#F0B90B', prices7d:[560,570,578,590,585,594,598] },
  { rank:4,  name:'Solana',       symbol:'SOL',  price:172,        change:5.21,  cap:78,   vol:4.8,  category:'layer1',     color:'#9945FF', prices7d:[148,155,160,158,165,168,172] },
  { rank:5,  name:'XRP',          symbol:'XRP',  price:0.612,      change:-0.45, cap:66,   vol:2.9,  category:'layer1',     color:'#00AAE4', prices7d:[0.58,0.59,0.61,0.62,0.61,0.615,0.612] },
  { rank:6,  name:'USDC',         symbol:'USDC', price:1.00,       change:0.01,  cap:44,   vol:8.2,  category:'stablecoin', color:'#2775CA', prices7d:[1,1,1,1,1,1,1] },
  { rank:7,  name:'Cardano',      symbol:'ADA',  price:0.498,      change:3.14,  cap:17,   vol:0.8,  category:'layer1',     color:'#0033AD', prices7d:[0.44,0.46,0.47,0.485,0.48,0.492,0.498] },
  { rank:8,  name:'Avalanche',    symbol:'AVAX', price:38.2,       change:-2.88, cap:15,   vol:0.6,  category:'layer1',     color:'#E84142', prices7d:[36,37,39,40,38,37.5,38.2] },
  { rank:9,  name:'TRON',         symbol:'TRX',  price:0.124,      change:1.05,  cap:11,   vol:0.5,  category:'layer1',     color:'#FF0013', prices7d:[0.118,0.12,0.121,0.122,0.123,0.1235,0.124] },
  { rank:10, name:'Chainlink',    symbol:'LINK', price:14.82,      change:4.67,  cap:9,    vol:0.7,  category:'defi',       color:'#2A5ADA', prices7d:[13,13.5,14,14.2,14.5,14.7,14.82] },
  { rank:11, name:'Polygon',      symbol:'MATIC',price:0.892,      change:-1.33, cap:8,    vol:0.4,  category:'layer2',     color:'#8247E5', prices7d:[0.85,0.87,0.88,0.91,0.9,0.895,0.892] },
  { rank:12, name:'Polkadot',     symbol:'DOT',  price:7.84,       change:2.11,  cap:10,   vol:0.3,  category:'layer1',     color:'#E6007A', prices7d:[7.2,7.4,7.5,7.7,7.65,7.78,7.84] },
  { rank:13, name:'Dogecoin',     symbol:'DOGE', price:0.162,      change:6.88,  cap:23,   vol:2.1,  category:'meme',       color:'#C2A633', prices7d:[0.14,0.145,0.15,0.155,0.158,0.16,0.162] },
  { rank:14, name:'Shiba Inu',    symbol:'SHIB', price:0.0000252,  change:-3.45, cap:14,   vol:0.9,  category:'meme',       color:'#F00500', prices7d:[0.000024,0.0000245,0.000025,0.000026,0.0000258,0.0000255,0.0000252] },
  { rank:15, name:'Uniswap',      symbol:'UNI',  price:8.94,       change:1.78,  cap:5,    vol:0.3,  category:'defi',       color:'#FF007A', prices7d:[8.2,8.4,8.5,8.7,8.8,8.9,8.94] },
  { rank:16, name:'Litecoin',     symbol:'LTC',  price:84.3,       change:0.44,  cap:6,    vol:0.4,  category:'layer1',     color:'#BFBBBB', prices7d:[80,81,82,83,83.5,84,84.3] },
  { rank:17, name:'Arbitrum',     symbol:'ARB',  price:1.12,       change:-0.9,  cap:3,    vol:0.2,  category:'layer2',     color:'#28A0F0', prices7d:[1.05,1.08,1.1,1.12,1.11,1.115,1.12] },
  { rank:18, name:'Optimism',     symbol:'OP',   price:2.34,       change:3.21,  cap:2,    vol:0.2,  category:'layer2',     color:'#FF0420', prices7d:[2.1,2.15,2.2,2.25,2.28,2.32,2.34] },
  { rank:19, name:'Pepe',         symbol:'PEPE', price:0.00001142, change:12.4,  cap:4,    vol:1.2,  category:'meme',       color:'#00A859', prices7d:[0.000009,0.0000095,0.0000098,0.00001,0.0000105,0.0000108,0.00001142] },
  { rank:20, name:'Aave',         symbol:'AAVE', price:95.4,       change:2.88,  cap:1.4,  vol:0.1,  category:'defi',       color:'#B6509E', prices7d:[88,90,91,93,94,95,95.4] },
];

const REGIONS = {
  'N. America': {
    color: '#00c4ff',
    label: 'N. America',
    activity: 'HIGH',
    volume: '$24.3B',
    topCoins: ['BTC','ETH','SOL'],
    sentiment: 62,
    exchanges: ['Coinbase','Kraken','Gemini'],
  },
  'Europe': {
    color: '#00ff9d',
    label: 'Europe',
    activity: 'MEDIUM',
    volume: '$18.1B',
    topCoins: ['ETH','BNB','XRP'],
    sentiment: 55,
    exchanges: ['Binance','Bitstamp','Kraken'],
  },
  'Asia Pac.': {
    color: '#ffb800',
    label: 'Asia Pacific',
    activity: 'VERY HIGH',
    volume: '$38.7B',
    topCoins: ['BNB','SOL','TRX'],
    sentiment: 74,
    exchanges: ['OKX','Bybit','HTX'],
  },
  'Middle East': {
    color: '#ff6b35',
    label: 'Middle East',
    activity: 'GROWING',
    volume: '$5.4B',
    topCoins: ['BTC','USDC','XRP'],
    sentiment: 58,
    exchanges: ['Rain','BitOasis','Binance'],
  },
  'L. America': {
    color: '#b44fff',
    label: 'Latin America',
    activity: 'MEDIUM',
    volume: '$8.9B',
    topCoins: ['BTC','USDT','SOL'],
    sentiment: 61,
    exchanges: ['Bitso','Mercado Bitcoin'],
  },
  'Africa': {
    color: '#ff3d6e',
    label: 'Africa',
    activity: 'EMERGING',
    volume: '$3.1B',
    topCoins: ['BTC','USDT','BNB'],
    sentiment: 49,
    exchanges: ['Luno','Yellow Card','Paxful'],
  },
};

const AI_SIGNALS = [
  {
    symbol:'BTC', action:'SELL', price:67420, change:-2.1,
    meta:'Layer 1 / Store of Value',
    confidence:72, uncertainty:18,
    aiText:'Bearish divergence on RSI. Whale wallets showing distribution patterns. Support at $64K critical.',
    risks:['Regulatory pressure mounting','ETF outflows accelerating','Mt.Gox distributions pending'],
  },
  {
    symbol:'SOL', action:'BUY', price:172, change:5.21,
    meta:'Layer 1 / Smart Contracts',
    confidence:81, uncertainty:11,
    aiText:'Bullish momentum with increasing DEX volume. Institutional inflows detected. Breaking multi-week resistance.',
    risks:['Network congestion risk','Validator concentration'],
  },
  {
    symbol:'ETH', action:'HOLD', price:3542, change:-1.12,
    meta:'Layer 1 / DeFi Hub',
    confidence:60, uncertainty:22,
    aiText:'Consolidating after recent rejection at $3600. Staking yields remain attractive. Dencun upgrade impact fading.',
    risks:['L2 cannibalizing fees','Macro headwinds'],
  },
  {
    symbol:'DOGE', action:'BUY', price:0.162, change:6.88,
    meta:'Meme / Payments',
    confidence:54, uncertainty:30,
    aiText:'Social sentiment spike on X (Twitter). High-risk speculative play. Musk-related catalysts possible.',
    risks:['High volatility','No fundamental backing','Retail-driven only'],
  },
  {
    symbol:'LINK', action:'BUY', price:14.82, change:4.67,
    meta:'DeFi / Oracle Infrastructure',
    confidence:77, uncertainty:14,
    aiText:'CCIP adoption accelerating. RWA tokenization trend benefits oracle networks. Accumulation zones forming.',
    risks:['Competition from Pyth','Smart contract exploits'],
  },
];

const NEWS_ITEMS = [
  { severity:'critical', time:'02:14', region:'Global',        text:'SEC approves spot ETH ETF options trading — market reacts positively' },
  { severity:'high',     time:'01:58', region:'Asia Pacific',  text:'Binance reports record $42B daily volume amid altseason rally' },
  { severity:'medium',   time:'01:44', region:'N. America',    text:'MicroStrategy adds 12,000 BTC to treasury — total holdings cross 220K' },
  { severity:'critical', time:'01:33', region:'Europe',        text:'ECB digital euro pilot extended through Q4 2025' },
  { severity:'high',     time:'01:19', region:'Middle East',   text:'UAE regulator grants new crypto exchange licenses to 3 firms' },
  { severity:'medium',   time:'01:07', region:'L. America',    text:'Brazil central bank launches tokenized real pilot on public blockchain' },
  { severity:'high',     time:'00:52', region:'Asia Pacific',  text:'South Korea passes comprehensive crypto regulation bill' },
  { severity:'critical', time:'00:38', region:'Global',        text:'Tether prints $2B USDT — liquidity injection signals bullish bias' },
];
