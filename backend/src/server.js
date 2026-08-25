require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { pool, initDatabase } = require('./database/models');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

const gameCache = {
  crazyTime: { results: [], lastUpdate: null },
  bigBaller: { results: [], lastUpdate: null },
  iceFishing: { results: [], lastUpdate: null },
  lightningRoulette: { results: [], lastUpdate: null },
  dreamCatcher: { results: [], lastUpdate: null },
  megaBall: { results: [], lastUpdate: null },
  lightningDice: { results: [], lastUpdate: null },
  coinRush: { results: [], lastUpdate: null }
};

function generateMockResult(gameName) {
  const games = {
    crazyTime: () => ({
      roundId: `CT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      wheelResult: { 
        segment: ['1', '2', '5', '10', 'CoinFlip', 'CashHunt', 'Pachinko', 'CrazyTime'][Math.floor(Math.random() * 8)],
        multiplier: Math.floor(Math.random() * 500) + 1 
      }
    }),
    bigBaller: () => ({
      roundId: `BB-${Date.now()}`,
      timestamp: new Date().toISOString(),
      numbersDrawn: Array.from({ length: 20 }, () => Math.floor(Math.random() * 75) + 1),
      bonusMultiplier: (Math.random() * 3 + 1).toFixed(1)
    }),
    iceFishing: () => ({
      roundId: `IF-${Date.now()}`,
      timestamp: new Date().toISOString(),
      wheelSegment: ['10', '20', '30', '40', '50', 'Fish'][Math.floor(Math.random() * 6)],
      fishMultiplier: (Math.random() * 5 + 1).toFixed(1)
    }),
    lightningRoulette: () => ({
      roundId: `LR-${Date.now()}`,
      timestamp: new Date().toISOString(),
      winningNumber: Math.floor(Math.random() * 37),
      lightningMultiplier: [50, 100, 150, 200, 300, 500][Math.floor(Math.random() * 6)],
      color: ['Red', 'Black', 'Green'][Math.floor(Math.random() * 3)]
    }),
    dreamCatcher: () => ({
      roundId: `DC-${Date.now()}`,
      timestamp: new Date().toISOString(),
      wheelSegment: ['1', '2', '5', '10', '20', '40'][Math.floor(Math.random() * 6)]
    }),
    megaBall: () => ({
      roundId: `MB-${Date.now()}`,
      timestamp: new Date().toISOString(),
      numbersDrawn: Array.from({ length: 5 }, () => Math.floor(Math.random() * 50) + 1),
      megaBall: Math.floor(Math.random() * 25) + 1,
      multiplier: [1, 2, 3, 5, 10][Math.floor(Math.random() * 5)]
    }),
    lightningDice: () => ({
      roundId: `LD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      diceResults: Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1),
      lightningMultiplier: [10, 25, 50, 100, 200][Math.floor(Math.random() * 5)]
    }),
    coinRush: () => ({
      roundId: `CR-${Date.now()}`,
      timestamp: new Date().toISOString(),
      result: ['coin', 'coin', 'coin', 'bonus', 'jackpot'][Math.floor(Math.random() * 5)],
      value: Math.floor(Math.random() * 100) + 1
    })
  };
  
  const result = games[gameName]();
  if (result.diceResults) {
    result.total = result.diceResults.reduce((a, b) => a + b, 0);
  }
  return result;
}

function broadcastNewResult(gameName, result) {
  const cache = gameCache[gameName];
  if (!cache) return;
  
  cache.results.unshift(result);
  if (cache.results.length > 100) cache.results.pop();
  cache.lastUpdate = new Date();
  
  io.emit('newResult', { game: gameName, result });
}

function startMockGenerators() {
  const gameNames = Object.keys(gameCache);
  gameNames.forEach((name) => {
    setInterval(() => {
      const result = generateMockResult(name);
      broadcastNewResult(name, result);
    }, 8000 + Math.random() * 4000);
  });
}

app.get('/api/games', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM games ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/results/:game', (req, res) => {
  const gameName = req.params.game;
  const cache = gameCache[gameName];
  if (!cache) return res.status(404).json({ error: 'Game not found' });
  res.json(cache.results.slice(0, 50));
});

io.on('connection', (socket) => {
  console.log('🟢 User connected');
  socket.emit('initData', gameCache);
  
  socket.on('disconnect', () => {
    console.log('🔴 User disconnected');
  });
});

async function startApp() {
  await initDatabase();
  
  const check = await pool.query('SELECT COUNT(*) FROM games');
  if (parseInt(check.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO games (name, display_name, category, icon) VALUES
      ('crazyTime', 'Crazy Time', 'wheel', '🎡'),
      ('bigBaller', 'Monopoly Big Baller', 'bingo', '🏠'),
      ('iceFishing', 'Ice Fishing', 'wheel', '🎣'),
      ('lightningRoulette', 'Lightning Roulette', 'roulette', '🎰'),
      ('dreamCatcher', 'Dream Catcher', 'wheel', '🎯'),
      ('megaBall', 'Mega Ball', 'bingo', '⚡'),
      ('lightningDice', 'Lightning Dice', 'dice', '🎲'),
      ('coinRush', 'Coin Rush', 'arcade', '🪙')
    `);
  }
  
  startMockGenerators();
  
  server.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
  });
}

startApp();
