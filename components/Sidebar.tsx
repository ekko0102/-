import React from 'react';
import { GameState, InventoryItem } from '../types';
import { ITEMS } from '../constants';
import { Coins, Star, Trophy, Package } from 'lucide-react';

interface SidebarProps {
  gameState: GameState;
  onSell: (item: InventoryItem) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ gameState, onSell }) => {
  const xpNext = gameState.level * 100 * 1.5;
  const progressPercent = Math.min(100, (gameState.xp / xpNext) * 100);

  return (
    <div className="w-full md:w-80 bg-gothic-900 border-r border-gothic-700 flex flex-col h-full font-serif text-zinc-300">
      <div className="p-6 border-b border-gothic-700 bg-gothic-950">
        <h1 className="text-2xl font-bold text-zinc-100 mb-1 tracking-widest">GOTHIC HARVEST</h1>
        <p className="text-xs text-zinc-500 italic">Reap what you sow in the shadows.</p>
      </div>

      {/* Stats */}
      <div className="p-4 space-y-4 border-b border-gothic-700 bg-gothic-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-400" />
            <span className="font-semibold">Level {gameState.level}</span>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-gothic-gold" />
            <span className="font-mono text-amber-100">{gameState.gold}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Experience</span>
            <span>{Math.floor(gameState.xp)} / {Math.floor(xpNext)}</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
            <div 
              className="h-full bg-purple-900" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
          <Package className="w-4 h-4" />
          Storage
        </h2>
        
        <div className="grid grid-cols-1 gap-2">
          {gameState.inventory.length === 0 && (
            <p className="text-zinc-600 text-sm text-center py-4">Your storehouse is empty.</p>
          )}
          {gameState.inventory.map((slot) => {
            const item = ITEMS[slot.itemId];
            if (!item) return null;
            return (
              <div key={slot.itemId} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-700 rounded hover:border-zinc-500 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-lg">
                    {/* Simple icon mapping based on category for now if Lucide mapping is complex dynamically */}
                    {item.category === 'CROP' ? '🌱' : 
                     item.category === 'ANIMAL' ? '🐾' : 
                     item.category === 'PRODUCT' ? '📦' : '🥣'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-200">{item.name}</div>
                    <div className="text-xs text-zinc-500">Qty: {slot.count}</div>
                  </div>
                </div>
                {item.sellPrice > 0 && (
                  <button 
                    onClick={() => onSell(slot)}
                    className="px-3 py-1 text-xs bg-zinc-800 hover:bg-gothic-gold hover:text-black border border-zinc-600 rounded transition-colors"
                  >
                    Sell ({item.sellPrice}g)
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Log - "Grim Ledger" */}
      <div className="p-4 border-t border-gothic-700 h-48 overflow-y-auto bg-black text-xs font-mono space-y-1">
        <h3 className="text-zinc-500 mb-2 uppercase text-[10px] tracking-widest">Grim Ledger</h3>
        {gameState.gameLog.slice().reverse().map((log, idx) => (
          <div key={idx} className="text-zinc-400 border-l-2 border-zinc-800 pl-2 py-0.5">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
