import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const gameConfigs = {
  crazyTime: { name: 'Crazy Time', icon: '🎡', color: '#FF6B35' },
  bigBaller: { name: 'Monopoly Big Baller', icon: '🏠', color: '#FFD700' },
  iceFishing: { name: 'Ice Fishing', icon: '🎣', color: '#00BFFF' },
  lightningRoulette: { name: 'Lightning Roulette', icon: '🎰', color: '#FF0040' },
  dreamCatcher: { name: 'Dream Catcher', icon: '🎯', color: '#9B59B6' },
  megaBall: { name: 'Mega Ball', icon: '⚡', color: '#00FF88' },
  lightningDice: { name: 'Lightning Dice', icon: '🎲', color: '#FFA500' },
  coinRush: { name: 'Coin Rush', icon: '🪙', color: '#F1C40F' }
};

export default function GameDetail({ gameData }) {
  const { gameName } = useParams();
  const config = gameConfigs[gameName];
  const data = gameData[gameName];
  const results = data?.results || [];
  const latest = results[0];

  if (!config) return <div className="text-center py-20">Game not found</div>;

  const chartData = results.slice(0, 30).reverse().map((r, i) => ({
    index: i + 1,
    value: r.wheelResult?.multiplier || r.lightningMultiplier || parseFloat(r.wheelSegment) || parseFloat(r.result) || r.total || r.megaBall || i
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <Link to="/" className="text-secondary hover:text-white text-sm mb-4 inline-block">← Back to Games</Link>
      <div className="bg-card rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{config.icon}</span>
          <h1 className="text-2xl font-bold">{config.name}</h1>
          <span className="text-xs text-green ml-auto">⚡ LIVE</span>
        </div>
        {latest && (
          <div className="bg-dark/50 rounded-lg p-4 mb-4 glow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-secondary">Latest Result</div>
                <div className="text-3xl font-bold" style={{ color: config.color }}>
                  {latest.wheelResult?.segment || latest.winningNumber || latest.wheelSegment || latest.result || '--'}
                </div>
              </div>
              {latest.lightningMultiplier && (
                <div className="text-center">
                  <div className="text-sm text-secondary">Multiplier</div>
                  <div className="text-3xl font-bold text-yellow-400">⚡{latest.lightningMultiplier}x</div>
                </div>
              )}
            </div>
          </div>
        )}
        {chartData.length > 1 && (
          <div className="h-48 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="index" stroke="#8892b0" />
                <YAxis stroke="#8892b0" />
                <Tooltip contentStyle={{ background: '#16213e', border: 'none', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="value" stroke={config.color} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">History</h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {results.slice(0, 50).map((result, idx) => {
              let display = '--';
              if (result.wheelResult?.segment) display = result.wheelResult.segment;
              else if (result.winningNumber !== undefined) display = result.winningNumber;
              else if (result.wheelSegment) display = result.wheelSegment;
              else if (result.diceResults) display = result.diceResults.join(',');
              else if (result.result) display = result.result;
              return (
                <div key={idx} className="flex items-center gap-3 text-sm py-1.5 border-b border-white/5">
                  <span className="text-secondary">#{results.length - idx}</span>
                  <span className="font-bold" style={{ color: config.color }}>{display}</span>
                  {idx === 0 && <span className="text-green text-xs ml-auto">NEW</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
