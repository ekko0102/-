export enum ItemCategory {
  CROP = 'CROP',
  ANIMAL = 'ANIMAL',
  PRODUCT = 'PRODUCT',
  PROCESSED = 'PROCESSED',
}

export interface GameItem {
  id: string;
  name: string;
  category: ItemCategory;
  unlockLevel: number;
  buyPrice: number; // Cost to buy seed/animal
  sellPrice: number; // Sale value
  growthTime: number; // Ticks to mature/produce
  xpReward: number;
  iconName: string;
  description: string;
  outputId?: string; // For animals/processing (e.g., Cow -> Milk)
}

export interface Plot {
  id: string;
  type: 'EMPTY' | 'CROP' | 'ANIMAL' | 'BUILDING';
  itemId?: string; // What is planted/raised here
  progress: number; // 0 to 100
  isReady: boolean;
  isWithered?: boolean;
}

export interface InventoryItem {
  itemId: string;
  count: number;
}

export interface ProcessingSlot {
  id: string;
  active: boolean;
  inputItemId?: string;
  progress: number;
  outputItemId?: string;
}

export interface GameState {
  gold: number;
  xp: number;
  level: number;
  plots: Plot[];
  inventory: InventoryItem[];
  processingSlots: ProcessingSlot[];
  wolfActive: boolean;
  wolfHealth: number; // Simple click counter to defeat
  gameLog: string[];
}

export type OracleResponse = {
  text: string;
  effect?: 'growth_boost' | 'price_surge' | 'gloom';
};
