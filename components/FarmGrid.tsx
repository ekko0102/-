import React from 'react';
import { Plot, GameState } from '../types';
import { ITEMS, PROCESSING_RECIPES } from '../constants';
import { Shovel, Hand, Zap, Factory } from 'lucide-react';

interface FarmGridProps {
  plots: Plot[];
  onPlotClick: (plot: Plot) => void;
  selectedTool: string; // 'plant_wheat', 'harvest', etc.
  gameState: GameState;
}

const FarmGrid: React.FC<FarmGridProps> = ({ plots, onPlotClick, selectedTool, gameState }) => {
  
  const getPlotContent = (plot: Plot) => {
    if (plot.type === 'EMPTY') {
      return (
        <div className="text-zinc-700 flex flex-col items-center justify-center h-full">
          <Shovel className="w-8 h-8 opacity-20" />
          <span className="text-xs mt-2 opacity-30">Barren Soil</span>
        </div>
      );
    }

    if (plot.type === 'BUILDING') {
      return (
         <div className="flex flex-col items-center justify-center h-full text-amber-700/80">
          <Factory className="w-10 h-10 mb-2 drop-shadow-lg" />
          <span className="text-xs font-bold uppercase tracking-widest text-amber-900">Processing</span>
          <div className="mt-2 text-[10px] text-zinc-400">Click to Craft</div>
        </div>
      );
    }

    const item = plot.itemId ? ITEMS[plot.itemId] : null;
    
    if (!item) return null;

    // Visual state for growth
    const isGrown = plot.progress >= 100;
    const isAnimal = plot.type === 'ANIMAL';
    
    return (
      <div className="flex flex-col items-center justify-center h-full relative w-full">
        {/* Progress Bar */}
        {!isGrown && !plot.isReady && (
          <div className="absolute top-2 left-2 right-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-900 transition-all duration-300" 
              style={{ width: `${plot.progress}%` }} 
            />
          </div>
        )}

        {/* Icon/Visual */}
        <div className={`text-4xl transition-transform duration-500 ${isGrown && !isAnimal ? 'scale-110 drop-shadow-glow' : ''}`}>
           {/* Simple emoji mapping for visual clarity in grid */}
           {item.category === 'CROP' && plot.progress < 50 ? '🌱' : 
            item.category === 'CROP' && plot.progress < 100 ? '🌿' :
            item.id === 'wheat_seed' ? '🌾' :
            item.id === 'pumpkin_seed' ? '🎃' :
            item.id === 'nightshade_seed' ? '🥀' :
            item.id === 'chicken' ? '🐔' :
            item.id === 'cow' ? '🐂' : '❓'}
        </div>

        {/* Status Text */}
        <div className="mt-2 text-xs font-medium text-zinc-400 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm border border-zinc-800">
           {isAnimal ? (
             plot.isReady ? <span className="text-yellow-500 animate-pulse">Product Ready</span> : item.name
           ) : (
             isGrown ? <span className="text-emerald-500 animate-pulse">Harvest Ready</span> : 'Growing...'
           )}
        </div>
        
        {/* Interaction Hint */}
        {((isGrown && !isAnimal) || (isAnimal && plot.isReady)) && (
          <div className="absolute inset-0 bg-emerald-900/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg cursor-pointer">
            <Hand className="text-emerald-400 w-8 h-8 drop-shadow-md" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
      {plots.map((plot) => (
        <button
          key={plot.id}
          onClick={() => onPlotClick(plot)}
          disabled={gameState.wolfActive} // Disable normal interaction during wolf attack
          className={`
            relative aspect-square rounded-lg border-2 transition-all duration-200
            ${plot.type === 'EMPTY' ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-600' : 'bg-zinc-800 border-zinc-700'}
            ${gameState.wolfActive ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:shadow-lg hover:shadow-zinc-900/50'}
            overflow-hidden group
          `}
        >
          {getPlotContent(plot)}
        </button>
      ))}
    </div>
  );
};

export default FarmGrid;
