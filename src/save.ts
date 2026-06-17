/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SaveData, UpgradeType } from './types';

const STORAGE_KEY = 'furry_force_tails_of_valor_save';

export const INITIAL_SAVE: SaveData = {
  carrots: 150, // Give some starter carrots to try the upgrade screen!
  gems: 10,
  upgrades: {
    health: 1,
    damage: 1,
    multiplier: 1,
  },
  completedLevels: [],
  highScores: {},
};

export const UPGRADES_CONFIG: Record<string, UpgradeType> = {
  health: {
    id: 'health',
    name: 'Nano-Shielding HP',
    description: 'Increases Dog Hero max shield health to survive obstacle strikes.',
    currentLevel: 1,
    maxLevel: 10,
    baseValue: 100,
    multiplierPerLevel: 25,
    baseCost: 50,
    costScale: 1.5,
  },
  damage: {
    id: 'damage',
    name: 'Initial Star-Power',
    description: 'Boosts the starting energy level of your laser projections.',
    currentLevel: 1,
    maxLevel: 10,
    baseValue: 10,
    multiplierPerLevel: 5,
    baseCost: 60,
    costScale: 1.6,
  },
  multiplier: {
    id: 'multiplier',
    name: 'Carrot Detector',
    description: 'Increases the carrot multiplier when defeating rogue bots.',
    currentLevel: 1,
    maxLevel: 5,
    baseValue: 1.0,
    multiplierPerLevel: 0.2,
    baseCost: 80,
    costScale: 1.8,
  },
};

export const SaveProvider = {
  load(): SaveData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as SaveData;
        // Merge missing keys in case of schema drifts
        return {
          ...INITIAL_SAVE,
          ...parsed,
          upgrades: {
            ...INITIAL_SAVE.upgrades,
            ...(parsed.upgrades || {}),
          },
          completedLevels: parsed.completedLevels || [],
          highScores: parsed.highScores || {},
        };
      }
    } catch (e) {
      console.error('Failed to load save data:', e);
    }
    return { ...INITIAL_SAVE };
  },

  save(data: SaveData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save data:', e);
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear data:', e);
    }
  },

  getHealthValue(level: number): number {
    const config = UPGRADES_CONFIG.health;
    return config.baseValue + (level - 1) * config.multiplierPerLevel;
  },

  getDamageValue(level: number): number {
    const config = UPGRADES_CONFIG.damage;
    return config.baseValue + (level - 1) * config.multiplierPerLevel;
  },

  getMultiplierValue(level: number): number {
    const config = UPGRADES_CONFIG.multiplier;
    return config.baseValue + (level - 1) * config.multiplierPerLevel;
  },

  getUpgradeCost(id: 'health' | 'damage' | 'multiplier', currentLevel: number): number {
    const config = UPGRADES_CONFIG[id];
    if (currentLevel >= config.maxLevel) return Infinity;
    return Math.round(config.baseCost * Math.pow(config.costScale, currentLevel - 1));
  }
};
