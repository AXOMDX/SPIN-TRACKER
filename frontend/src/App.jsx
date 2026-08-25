import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './screens/Home';
import GameDetail from './screens/GameDetail';
import StatsDashboard from './screens/StatsDashboard';

const socket = io('http://localhost:3000');

function App() {
  const [gameData, setGameData] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });
    socket.on('initData', (data) => setGameData(data));
    socket.on('newResult', ({ game, result }) => {
      setGameData(prev => ({
        ...prev,
        [game]: {
          results: [result, ...(prev[game]?.results || [])],
          lastUpdate: new Date()
        }
      }));
    });
    return () => {
      socket.off('connect');
      socket.off('initData');
      socket.off('newResult');
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark text-white">
        <div className="fixed top-0 w-full z-50 bg-dark/95 backdrop-blur-sm border-b border-card">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span className="font-bold text-xl">SpinTracker</span>
              <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${isConnected ? 'bg-green/20 text-green' : 'bg-red-500/20 text-red-400'}`}>
                {isConnected ? '⚡ LIVE' : '🔴 OFFLINE'}
              </span>
            </div>
            <div className="flex gap-4 text-sm">
              <Link to="/" className="hover:text-accent transition">Home</Link>
              <Link to="/stats" className="hover:text-accent transition">Stats</Link>
            </div>
          </div>
        </div>
        <div className="pt-16 pb-20">
          <Routes>
            <Route path="/" element={<Home gameData={gameData} />} />
            <Route path="/game/:gameName" element={<GameDetail gameData={gameData} />} />
            <Route path="/stats" element={<StatsDashboard gameData={gameData} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
