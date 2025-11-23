import React from 'react';
import { InventoryItem, GameState } from '../types';
import { ITEMS, PROCESSING_RECIPES } from '../constants';
import { X, ArrowRight, Loader2 } from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onProcess: (inputItemId: string, outputItemId: string) => void;
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({ isOpen, onClose, gameState, onProcess }) => {
  if (!isOpen) return null;

  // Identify what can be processed from inventory
  const processableItems = gameState.inventory.filter(slot => PROCESSING_RECIPES[slot.itemId]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-600 w-full max-w-lg rounded-xl shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-950 rounded-t-xl">
          <h2 className="text-xl font-serif text-zinc-100 flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin-slow text-amber-600" />
            Processing Plant
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {processableItems.length === 0 ? (
            <p className="text-center text-zinc-500 py-8 italic">
              You have no raw materials (Wheat, Milk) to process.
            </p>
          ) : (
            processableItems.map(slot => {
              const inputItem = ITEMS[slot.itemId];
              const outputId = PROCESSING_RECIPES[slot.itemId];
              const outputItem = ITEMS[outputId];

              return (
                <div key={slot.itemId} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                  {/* Input */}
                  <div className="flex flex-col items-center w-24">
                    <span className="text-2xl mb-1">
                        {inputItem.category === 'PRODUCT' && inputItem.id === 'wheat' ? '🌾' : '🥛'}
                    </span>
                    <span className="text-sm font-medium text-zinc-300">{inputItem.name}</span>
                    <span className="text-xs text-zinc-500">x{slot.count} owned</span>
                  </div>

                  <ArrowRight className="text-zinc-600" />

                  {/* Output */}
                  <div className="flex flex-col items-center w-24">
                     <span className="text-2xl mb-1">
                        {outputItem.id === 'bread' ? '🍞' : '🧀'}
                     </span>
                    <span className="text-sm font-medium text-amber-200">{outputItem.name}</span>
                    <span className="text-xs text-amber-500/70">{outputItem.sellPrice}g value</span>
                  </div>

                  <button
                    onClick={() => onProcess(slot.itemId, outputId)}
                    className="ml-4 px-4 py-2 bg-amber-900 hover:bg-amber-800 text-amber-100 text-sm font-bold rounded border border-amber-700 transition-colors"
                  >
                    Craft
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessingModal;
