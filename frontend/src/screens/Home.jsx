import React from 'react';
import { Link } from 'react-router-dom';

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

function GameCard({ gameKey, data }) {
  const config = gameConfigs[gameKey];
  if (!config) return null;
  const latest = data?.results?.[0];
  const lastUpdate = data?.lastUpdate;
  const timeAgo = lastUpdate ? Math.floor((new Date() - new Date(lastUpdate)) / 1000) : null;
  
  let displayResult = '--';
  if (latest) {
    if (latest.wheelResult?.segment) displayResult = latest.wheelResult.segment;
    else if (latest.winningNumber !== undefined) displayResult = latest.winningNumber;
    else if (latest.wheelSegment) displayResult = latest.wheelSegment;
    else if (latest.diceResults) displayResult = latest.diceResults.join(',');
    else if (latest.result) displayResult = latest.result;
  }

  return (
    <Link to={`/game/${gameKey}`} className="block">
      <div className="bg-card rounded-xl p-4 hover:scale-105 transition-all duration-200 cursor-pointer border border-white/5 hover:border-accent/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl">{config.icon}</span>
          {timeAgo !== null && timeAgo < 10 && <span className="text-xs text-green animate-pulse">● LIVE</span>}
        </div>
        <h3 className="font-semibold text-sm truncate">{config.name}</h3>
        <div className="mt-2">
          <span className="text-2xl font-bold" style={{ color: config.color }}>{displayResult}</span>
          {latest?.lightningMultiplier && (
            <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">⚡{latest.lightningMultiplier}x</span>
          )}
        </div>
        <div className="mt-1 text-xs text-secondary">{timeAgo !== null ? `${timeAgo}s ago` : 'Waiting...'}</div>
      </div>
    </Link>
  );
}

export default function Home({ gameData }) {
  const gameKeys = Object.keys(gameConfigs);
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">🎯 Live Games</h1>
        <p className="text-secondary text-sm">Real-time results from Evolution Gaming</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {gameKeys.map(key => <GameCard key={key} gameKey={key} data={gameData[key]} />)}
      </div>
      <div className="mt-8 bg-card rounded-xl p-4 border border-white/5">
        <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
          <span className="text-green text-xl">●</span> Live Feed
        </h2>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {Object.entries(gameData).flatMap(([gameKey, data]) =>
            (data?.results || []).slice(0, 3).map((result, idx) => {
              const config = gameConfigs[gameKey];
              if (!config) return null;
              let display = '--';
              if (result.wheelResult?.segment) display = result.wheelResult.segment;
              else if (result.winningNumber !== undefined) display = result.winningNumber;
              else if (result.wheelSegment) display = result.wheelSegment;
              else if (result.diceResults) display = result.diceResults.join(',');
              else if (result.result) display = result.result;
              return (
                <div key={`${gameKey}-${idx}`} className="flex items-center gap-3 text-sm py-1 border-b border-white/5">
                  <span>{config.icon}</span>
                  <span className="text-secondary flex-1">{config.name}</span>
                  <span className="font-bold" style={{ color: config.color }}>{display}</span>
                  {idx === 0 && <span className="text-green text-xs">NEW</span>}
                </div>
              );
            })
          ).filter(Boolean)}
        </div>
      </div>
    </div>
  );
}
