import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function StatsDashboard({ gameData }) {
  const [selectedGame, setSelectedGame] = useState('crazyTime');
  const gameNames = Object.keys(gameData);
  const results = gameData[selectedGame]?.results || [];
  
  const values = results.map(r => 
    r.wheelResult?.multiplier || r.lightningMultiplier || parseFloat(r.wheelSegment) || parseFloat(r.result) || r.total || r.megaBall || 0
  ).filter(v => v > 0);
  
  const frequency = {};
  values.forEach(v => { frequency[v] = (frequency[v] || 0) + 1; });
  
  const chartData = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, value]) => ({ name, value }));
  
  const totalRounds = results.length;
  const avgValue = totalRounds > 0 ? (values.reduce((a, b) => a + b, 0) / totalRounds).toFixed(1) : 0;
  const maxValue = totalRounds > 0 ? Math.max(...values) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold mb-4">📊 Stats Dashboard</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        {gameNames.map(name => (
          <button key={name} onClick={() => setSelectedGame(name)}
            className={`px-3 py-1.5 rounded-full text-sm transition ${selectedGame === name ? 'bg-accent text-white' : 'bg-card text-secondary hover:text-white'}`}>
            {name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card rounded-lg p-3 text-center">
          <div className="text-xs text-secondary">Rounds</div>
          <div className="text-2xl font-bold">{totalRounds}</div>
        </div>
        <div className="bg-card rounded-lg p-3 text-center">
          <div className="text-xs text-secondary">Avg</div>
          <div className="text-2xl font-bold text-green">{avgValue}</div>
        </div>
        <div className="bg-card rounded-lg p-3 text-center">
          <div className="text-xs text-secondary">Max</div>
          <div className="text-2xl font-bold text-gold">{maxValue}</div>
        </div>
      </div>
      <div className="bg-card rounded-xl p-4 border border-white/5">
        <h3 className="font-semibold text-sm mb-3">Frequency Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#8892b0" fontSize={10} />
              <YAxis stroke="#8892b0" fontSize={10} />
              <Tooltip contentStyle={{ background: '#16213e', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="value" fill="#e94560" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
