import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Plot, InventoryItem, GameItem, ItemCategory, OracleResponse } from './types';
import { ITEMS, TICK_RATE, WOLF_CHANCE, MAX_PLOTS, XP_PER_LEVEL_BASE } from './constants';
import Sidebar from './components/Sidebar';
import FarmGrid from './components/FarmGrid';
import MarketModal from './components/MarketModal';
import WolfEvent from './components/WolfEvent';
import ProcessingModal from './components/ProcessingModal';
import { getGothicOraclePrediction } from './services/geminiService';
import { PlusCircle, ShoppingBag, Eye } from 'lucide-react';

const INITIAL_PLOTS: Plot[] = Array(MAX_PLOTS).fill(null).map((_, i) => ({
  id: `plot-${i}`,
  type: i === MAX_PLOTS - 1 ? 'BUILDING' : 'EMPTY', // Last plot is processing plant
  progress: 0,
  isReady: false
}));

const App: React.FC = () => {
  // --- STATE ---
  const [gameState, setGameState] = useState<GameState>({
    gold: 50,
    xp: 0,
    level: 1,
    plots: INITIAL_PLOTS,
    inventory: [{ itemId: 'wheat_seed', count: 3 }],
    processingSlots: [],
    wolfActive: false,
    wolfHealth: 10,
    gameLog: ["Welcome to the shadowed lands. Plant seeds to survive."]
  });

  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [isProcessingOpen, setIsProcessingOpen] = useState(false);
  const [oracleActive, setOracleActive] = useState(false);

  // --- REFS ---
  const wolfTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- HELPERS ---
  const addToLog = (msg: string) => {
    setGameState(prev => ({
      ...prev,
      gameLog: [...prev.gameLog.slice(-19), msg] // Keep last 20
    }));
  };

  const addInventory = (itemId: string, count: number) => {
    setGameState(prev => {
      const existing = prev.inventory.find(i => i.itemId === itemId);
      let newInventory;
      if (existing) {
        newInventory = prev.inventory.map(i => i.itemId === itemId ? { ...i, count: i.count + count } : i);
      } else {
        newInventory = [...prev.inventory, { itemId, count }];
      }
      return { ...prev, inventory: newInventory };
    });
  };

  const checkLevelUp = useCallback((currentXp: number, currentLevel: number) => {
    const xpNeeded = currentLevel * XP_PER_LEVEL_BASE * 1.5;
    if (currentXp >= xpNeeded) {
      return { leveledUp: true, nextLevel: currentLevel + 1 };
    }
    return { leveledUp: false, nextLevel: currentLevel };
  }, []);

  const gainXp = (amount: number) => {
    setGameState(prev => {
      const newXp = prev.xp + amount;
      const { leveledUp, nextLevel } = checkLevelUp(newXp, prev.level);
      if (leveledUp) {
        // We can't use addToLog easily inside here without another state update or complex merging, 
        // so we append to log inside this update
        const logMsg = `You have ascended to Level ${nextLevel}. New dark secrets unlocked.`;
        return { 
          ...prev, 
          xp: newXp, 
          level: nextLevel,
          gameLog: [...prev.gameLog.slice(-19), logMsg]
        };
      }
      return { ...prev, xp: newXp };
    });
  };

  // --- GAME LOOP ---
  useEffect(() => {
    const tick = setInterval(() => {
      if (gameState.wolfActive) return; // Pause farm growth during attack

      // Random Wolf Event
      if (Math.random() < WOLF_CHANCE && !gameState.wolfActive) {
         setGameState(prev => ({ ...prev, wolfActive: true, wolfHealth: 10 + prev.level * 2 }));
         addToLog("A howl pierces the mist! A Shadow Wolf approaches!");
      }

      setGameState(prev => {
        // Update Plots
        const newPlots = prev.plots.map(plot => {
          if (plot.type === 'EMPTY' || plot.type === 'BUILDING') return plot;

          const item = plot.itemId ? ITEMS[plot.itemId] : null;
          if (!item) return plot;

          // If crop/animal is growing/producing
          if (plot.progress < 100 && !plot.isReady) {
            const growthRate = 100 / item.growthTime;
            const newProgress = Math.min(100, plot.progress + growthRate);
            
            // If it just finished growing
            if (newProgress >= 100) {
               if (plot.type === 'CROP') {
                 // Crops stay grown waiting for harvest
                 return { ...plot, progress: 100 }; 
               } else if (plot.type === 'ANIMAL') {
                 // Animals become ready to collect product
                 return { ...plot, progress: 100, isReady: true };
               }
            }
            return { ...plot, progress: newProgress };
          }
          return plot;
        });

        return { ...prev, plots: newPlots };
      });

    }, TICK_RATE);

    return () => clearInterval(tick);
  }, [gameState.wolfActive]); // Re-bind if wolf state changes significantly affecting the loop logic

  // --- INTERACTIONS ---

  const handlePlotClick = (plot: Plot) => {
    if (gameState.wolfActive) return;

    // 1. HARVEST CROP
    if (plot.type === 'CROP' && plot.progress >= 100) {
      const seedItem = ITEMS[plot.itemId!];
      const productItem = ITEMS[seedItem.outputId!];
      
      addInventory(productItem.id, 1);
      gainXp(seedItem.xpReward);
      addToLog(`Reaped ${productItem.name}.`);
      
      // Reset plot
      setGameState(prev => ({
        ...prev,
        plots: prev.plots.map(p => p.id === plot.id ? { ...p, type: 'EMPTY', itemId: undefined, progress: 0 } : p)
      }));
      return;
    }

    // 2. COLLECT ANIMAL PRODUCT
    if (plot.type === 'ANIMAL' && plot.isReady) {
      const animalItem = ITEMS[plot.itemId!];
      const productItem = ITEMS[animalItem.outputId!];

      addInventory(productItem.id, 1);
      gainXp(animalItem.xpReward);
      addToLog(`Collected ${productItem.name} from ${animalItem.name}.`);

      // Reset animal progress but keep animal
      setGameState(prev => ({
        ...prev,
        plots: prev.plots.map(p => p.id === plot.id ? { ...p, progress: 0, isReady: false } : p)
      }));
      return;
    }

    // 3. PLANT / PLACE
    if (plot.type === 'EMPTY' && selectedSeed) {
      const itemToPlant = ITEMS[selectedSeed];
      // Verify we have it
      const hasItem = gameState.inventory.find(i => i.itemId === selectedSeed && i.count > 0);
      
      if (hasItem) {
        // Atomic update: Remove inventory AND set plot
        setGameState(prev => {
           const newInventory = prev.inventory
             .map(i => i.itemId === selectedSeed ? { ...i, count: i.count - 1 } : i)
             .filter(i => i.count > 0);
           
           const plotType: Plot['type'] = itemToPlant.category === ItemCategory.CROP ? 'CROP' : 'ANIMAL';
           
           const newPlots = prev.plots.map(p => p.id === plot.id ? { ...p, type: plotType, itemId: selectedSeed, progress: 0, isReady: false } : p);

           return {
             ...prev,
             inventory: newInventory,
             plots: newPlots
           };
        });
        addToLog(`Planted ${itemToPlant.name}.`);
      } else {
        addToLog(`You possess no ${itemToPlant.name}.`);
        setSelectedSeed(null);
      }
      return;
    }

    // 4. OPEN PROCESSING
    if (plot.type === 'BUILDING') {
      setIsProcessingOpen(true);
    }
  };

  const handleSell = (item: InventoryItem) => {
    const gameItem = ITEMS[item.itemId];
    if (gameItem.sellPrice <= 0) return;

    setGameState(prev => {
      const existing = prev.inventory.find(i => i.itemId === item.itemId);
      // Safety check inside the update to prevent race conditions
      if (!existing || existing.count < 1) return prev;

      const newInventory = prev.inventory
        .map(i => i.itemId === item.itemId ? { ...i, count: i.count - 1 } : i)
        .filter(i => i.count > 0);

      return {
        ...prev,
        inventory: newInventory,
        gold: prev.gold + gameItem.sellPrice,
        gameLog: [...prev.gameLog.slice(-19), `Bartered ${gameItem.name} for ${gameItem.sellPrice} gold.`]
      };
    });
  };

  const handleBuy = (item: GameItem) => {
    if (gameState.gold >= item.buyPrice) {
      setGameState(prev => ({ ...prev, gold: prev.gold - item.buyPrice }));
      addInventory(item.id, 1);
      addToLog(`Acquired ${item.name}.`);
    }
  };

  const handleWolfAttack = () => {
    setGameState(prev => {
      const newHealth = prev.wolfHealth - 1;
      if (newHealth <= 0) {
        const rewardGold = 50 * prev.level;
        const rewardXp = 100;
        // We append log here manually to avoid state overrides
        return { 
          ...prev, 
          wolfActive: false, 
          gold: prev.gold + rewardGold, 
          xp: prev.xp + rewardXp,
          gameLog: [...prev.gameLog.slice(-19), `The beast is vanquished! Gained ${rewardGold}g and ${rewardXp} XP.`]
        };
      }
      return { ...prev, wolfHealth: newHealth };
    });
  };

  const handleProcess = (inputId: string, outputId: string) => {
    const hasItem = gameState.inventory.find(i => i.itemId === inputId && i.count > 0);
    
    if (hasItem) {
       // Deduct input immediately
       setGameState(prev => {
          const newInventory = prev.inventory
            .map(i => i.itemId === inputId ? { ...i, count: i.count - 1 } : i)
            .filter(i => i.count > 0);
          return { ...prev, inventory: newInventory };
       });

      addToLog("Processing started...");
      // For simplicity in this version, processing is instant but "feels" like work
      // In a more complex version, we'd use the processingSlots state.
      // Instant reward for MVP flow:
      const outputItem = ITEMS[outputId];
      setTimeout(() => {
        addInventory(outputId, 1);
        gainXp(outputItem.xpReward);
        addToLog(`Production complete: ${outputItem.name} created.`);
      }, 1000);
      setIsProcessingOpen(false);
    } else {
      addToLog("Not enough materials.");
    }
  };

  const invokeOracle = async () => {
    if (oracleActive) return;
    setOracleActive(true);
    addToLog("Consulting the spirits...");
    const prediction = await getGothicOraclePrediction(gameState.level, "foggy");
    addToLog(`Oracle: "${prediction.text}"`);
    
    if (prediction.effect === 'growth_boost') {
       // Apply immediate growth boost to all active crops
       setGameState(prev => ({
         ...prev,
         plots: prev.plots.map(p => (p.type === 'CROP' || p.type === 'ANIMAL') ? { ...p, progress: Math.min(100, p.progress + 20)} : p)
       }));
       addToLog("Effect: Vitality surge.");
    } else if (prediction.effect === 'price_surge') {
       setGameState(prev => ({ ...prev, gold: prev.gold + 50 }));
       addToLog("Effect: A small fortune found.");
    }
    setOracleActive(false);
  };

  // --- RENDER ---

  // Filter inventory for plantable items
  const plantableItems = gameState.inventory.filter(slot => {
    const item = ITEMS[slot.itemId];
    return item && (item.category === 'CROP' || item.category === 'ANIMAL');
  });

  return (
    <div className="flex h-screen w-full bg-gothic-950 text-zinc-200 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <Sidebar gameState={gameState} onSell={handleSell} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        
        {/* Top Bar */}
        <div className="h-16 border-b border-gothic-700 bg-gothic-900/80 flex items-center justify-between px-6 backdrop-blur-md">
           <div className="flex items-center gap-4">
             <span className="text-zinc-500 text-sm font-serif">Current Tool:</span>
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedSeed(null)}
                  className={`px-3 py-1 rounded text-sm border ${selectedSeed === null ? 'bg-zinc-100 text-black border-white' : 'bg-zinc-800 border-zinc-600 hover:bg-zinc-700'}`}
                >
                  Interact
                </button>
                {plantableItems.map(slot => (
                   <button
                     key={slot.itemId}
                     onClick={() => setSelectedSeed(slot.itemId)}
                     className={`
                       px-3 py-1 rounded text-sm border flex items-center gap-1
                       ${selectedSeed === slot.itemId 
                         ? 'bg-emerald-900/50 text-emerald-200 border-emerald-500' 
                         : 'bg-zinc-800 border-zinc-600 hover:bg-zinc-700'}
                     `}
                   >
                     {ITEMS[slot.itemId].name} ({slot.count})
                   </button>
                ))}
             </div>
           </div>

           <div className="flex items-center gap-2">
              <button 
                onClick={invokeOracle}
                disabled={oracleActive}
                className="p-2 rounded-full hover:bg-purple-900/30 text-purple-400 transition-colors"
                title="Consult Oracle (AI)"
              >
                <Eye className={`w-5 h-5 ${oracleActive ? 'animate-pulse' : ''}`} />
              </button>
              <button 
                onClick={() => setIsMarketOpen(true)}
                className="flex items-center gap-2 bg-amber-900/20 hover:bg-amber-900/40 text-amber-200 px-4 py-2 rounded border border-amber-900/50 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Market</span>
              </button>
           </div>
        </div>

        {/* Game Grid */}
        <div className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gothic-900 via-gothic-950 to-black">
          <div className="max-w-5xl mx-auto py-8">
            <FarmGrid 
              plots={gameState.plots} 
              onPlotClick={handlePlotClick}
              selectedTool={selectedSeed || 'interact'}
              gameState={gameState}
            />
          </div>
        </div>

      </div>

      {/* Modals */}
      <MarketModal 
        isOpen={isMarketOpen} 
        onClose={() => setIsMarketOpen(false)} 
        playerGold={gameState.gold}
        playerLevel={gameState.level}
        onBuy={handleBuy}
      />

      <ProcessingModal
        isOpen={isProcessingOpen}
        onClose={() => setIsProcessingOpen(false)}
        gameState={gameState}
        onProcess={handleProcess}
      />

      <WolfEvent 
        active={gameState.wolfActive} 
        health={gameState.wolfHealth} 
        onAttack={handleWolfAttack} 
      />

    </div>
  );
};

export default App;