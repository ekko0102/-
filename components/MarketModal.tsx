import React from 'react';
import { GameItem, InventoryItem } from '../types';
import { ITEMS } from '../constants';
import { X, Coins, Lock } from 'lucide-react';

interface MarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerGold: number;
  playerLevel: number;
  onBuy: (item: GameItem) => void;
}

const MarketModal: React.FC<MarketModalProps> = ({ isOpen, onClose, playerGold, playerLevel, onBuy }) => {
  if (!isOpen) return null;

  const buyableItems = Object.values(ITEMS).filter(item => item.buyPrice > 0);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-2xl rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <h2 className="text-2xl font-serif text-zinc-100">Dark Market</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {buyableItems.map(item => {
            const isLocked = playerLevel < item.unlockLevel;
            const canAfford = playerGold >= item.buyPrice;

            return (
              <div 
                key={item.id} 
                className={`
                  p-4 rounded border flex flex-col justify-between relative
                  ${isLocked ? 'bg-zinc-950 border-zinc-800 opacity-60' : 'bg-zinc-800 border-zinc-700'}
                `}
              >
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 rounded">
                    <div className="flex items-center gap-2 text-zinc-500 bg-black/80 px-3 py-1 rounded-full border border-zinc-800">
                      <Lock className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Lvl {item.unlockLevel}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-start mb-2">
                   <div>
                     <h3 className="font-bold text-zinc-200">{item.name}</h3>
                     <p className="text-xs text-zinc-500 mt-1">{item.description}</p>
                   </div>
                   <div className="text-2xl">
                     {/* Simplified icon logic */}
                     {item.category === 'CROP' ? '🌱' : '🐾'}
                   </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                   <div className="text-amber-500 font-mono flex items-center gap-1">
                     <Coins className="w-4 h-4" />
                     {item.buyPrice}
                   </div>
                   <button
                     disabled={isLocked || !canAfford}
                     onClick={() => onBuy(item)}
                     className={`
                       px-4 py-2 rounded text-sm font-bold transition-colors
                       ${isLocked || !canAfford 
                         ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed' 
                         : 'bg-zinc-100 text-zinc-900 hover:bg-white'}
                     `}
                   >
                     {canAfford ? 'Purchase' : 'Too Poor'}
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MarketModal;
