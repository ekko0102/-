import React from 'react';
import { ShieldAlert, Skull, Sword } from 'lucide-react';

interface WolfEventProps {
  active: boolean;
  health: number;
  onAttack: () => void;
}

const WolfEvent: React.FC<WolfEventProps> = ({ active, health, onAttack }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-zinc-900 border-2 border-red-900/50 p-8 rounded-xl max-w-md w-full text-center shadow-2xl shadow-red-900/20 relative overflow-hidden">
        
        {/* Background pulses */}
        <div className="absolute inset-0 bg-red-900/10 animate-pulse-slow pointer-events-none" />

        <div className="relative z-10">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-red-950/50 rounded-full border border-red-900">
              <Skull className="w-16 h-16 text-red-500 animate-bounce" />
            </div>
          </div>
          
          <h2 className="text-3xl font-serif font-bold text-red-500 mb-2">SHADOW WOLF ATTACK!</h2>
          <p className="text-zinc-400 mb-8">
            A beast from the void stalks your livestock. Drive it back before it steals your soul shards (XP)!
          </p>

          <div className="mb-6">
             <div className="text-sm text-red-400 mb-1 uppercase tracking-widest font-bold">Wolf Health</div>
             <div className="h-4 bg-zinc-950 rounded-full overflow-hidden border border-red-900/50">
               <div 
                 className="h-full bg-red-700 transition-all duration-100" 
                 style={{ width: `${(health / 10) * 100}%` }} // Assuming max health 10
               />
             </div>
          </div>

          <button
            onClick={onAttack}
            className="w-full py-4 bg-red-900 hover:bg-red-800 text-white font-bold rounded-lg border border-red-700 shadow-lg active:transform active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Sword className="w-5 h-5" />
            STRIKE THE BEAST!
          </button>
        </div>
      </div>
    </div>
  );
};

export default WolfEvent;
