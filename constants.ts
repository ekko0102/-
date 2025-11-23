import { GameItem, ItemCategory } from './types';
import { Sprout, Egg, Wheat, Milk, Drumstick, Apple, Candy, Cookie, Beef, Bean } from 'lucide-react'; // Imports handled in components usually, but defining data here

export const TICK_RATE = 1000; // 1 second
export const WOLF_CHANCE = 0.02; // 2% chance per tick
export const MAX_PLOTS = 12;
export const XP_PER_LEVEL_BASE = 100;

export const ITEMS: Record<string, GameItem> = {
  // CROPS
  'wheat_seed': {
    id: 'wheat_seed',
    name: 'Ghost Wheat',
    category: ItemCategory.CROP,
    unlockLevel: 1,
    buyPrice: 10,
    sellPrice: 0,
    growthTime: 5,
    xpReward: 10,
    iconName: 'Wheat',
    description: 'Pale wheat that sways without wind.',
    outputId: 'wheat'
  },
  'pumpkin_seed': {
    id: 'pumpkin_seed',
    name: 'Cursed Pumpkin',
    category: ItemCategory.CROP,
    unlockLevel: 3,
    buyPrice: 30,
    sellPrice: 0,
    growthTime: 10,
    xpReward: 25,
    iconName: 'Apple', // Using Apple as placeholder for pumpkin if unavailable, or generic fruit
    description: 'Glowing with an inner, eerie light.',
    outputId: 'pumpkin'
  },
  'nightshade_seed': {
    id: 'nightshade_seed',
    name: 'Nightshade',
    category: ItemCategory.CROP,
    unlockLevel: 6,
    buyPrice: 80,
    sellPrice: 0,
    growthTime: 20,
    xpReward: 60,
    iconName: 'Bean',
    description: 'Deadly beautiful purple flowers.',
    outputId: 'nightshade_flower'
  },

  // PRODUCE (Harvested Crops)
  'wheat': {
    id: 'wheat',
    name: 'Wheat Bundle',
    category: ItemCategory.PRODUCT,
    unlockLevel: 1,
    buyPrice: 0,
    sellPrice: 15,
    growthTime: 0,
    xpReward: 0,
    iconName: 'Wheat',
    description: 'Ready for the mill.',
  },
  'pumpkin': {
    id: 'pumpkin',
    name: 'Pumpkin',
    category: ItemCategory.PRODUCT,
    unlockLevel: 3,
    buyPrice: 0,
    sellPrice: 50,
    growthTime: 0,
    xpReward: 0,
    iconName: 'Apple',
    description: 'Heavy and ominous.',
  },
  'nightshade_flower': {
    id: 'nightshade_flower',
    name: 'Nightshade Flower',
    category: ItemCategory.PRODUCT,
    unlockLevel: 6,
    buyPrice: 0,
    sellPrice: 140,
    growthTime: 0,
    xpReward: 0,
    iconName: 'Bean',
    description: 'Handle with care.',
  },

  // ANIMALS
  'chicken': {
    id: 'chicken',
    name: 'Bone Chicken',
    category: ItemCategory.ANIMAL,
    unlockLevel: 2,
    buyPrice: 100,
    sellPrice: 50, // Can sell animal back
    growthTime: 8, // Production interval
    xpReward: 15,
    iconName: 'Egg',
    description: 'Clucks in a minor key.',
    outputId: 'egg'
  },
  'cow': {
    id: 'cow',
    name: 'Shadow Cow',
    category: ItemCategory.ANIMAL,
    unlockLevel: 5,
    buyPrice: 500,
    sellPrice: 250,
    growthTime: 15,
    xpReward: 40,
    iconName: 'Milk',
    description: 'Produces milk black as night.',
    outputId: 'milk'
  },

  // ANIMAL PRODUCTS
  'egg': {
    id: 'egg',
    name: 'Obsidian Egg',
    category: ItemCategory.PRODUCT,
    unlockLevel: 2,
    buyPrice: 0,
    sellPrice: 30,
    growthTime: 0,
    xpReward: 0,
    iconName: 'Egg',
    description: 'Hard as stone, rich in flavor.',
  },
  'milk': {
    id: 'milk',
    name: 'Void Milk',
    category: ItemCategory.PRODUCT,
    unlockLevel: 5,
    buyPrice: 0,
    sellPrice: 80,
    growthTime: 0,
    xpReward: 0,
    iconName: 'Milk',
    description: 'Cold to the touch.',
  },

  // PROCESSED GOODS
  'bread': {
    id: 'bread',
    name: 'Soul Bread',
    category: ItemCategory.PROCESSED,
    unlockLevel: 4,
    buyPrice: 0,
    sellPrice: 50, // Wheat(15) -> Bread(50)
    growthTime: 5, // Processing time
    xpReward: 20,
    iconName: 'Cookie',
    description: 'Nourishment for the weary soul.',
  },
  'cheese': {
    id: 'cheese',
    name: 'Moon Cheese',
    category: ItemCategory.PROCESSED,
    unlockLevel: 7,
    buyPrice: 0,
    sellPrice: 150, // Milk(80) -> Cheese(150)
    growthTime: 10,
    xpReward: 50,
    iconName: 'Candy',
    description: 'Aged in the crypts.',
  }
};

export const PROCESSING_RECIPES: Record<string, string> = {
  'wheat': 'bread',
  'milk': 'cheese',
};
