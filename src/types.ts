/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UpgradeType {
  id: 'health' | 'damage' | 'multiplier';
  name: string;
  description: string;
  currentLevel: number;
  maxLevel: number;
  baseValue: number;
  multiplierPerLevel: number;
  baseCost: number;
  costScale: number;
}

export interface SaveData {
  carrots: number;
  gems: number;
  upgrades: {
    health: number; // level (e.g. 1, 2, 3...)
    damage: number; // level
    multiplier: number; // level
  };
  completedLevels: string[]; // array of completed level ids
  highScores: Record<string, number>; // levelId -> score
}

export type MathOp = 'add' | 'subtract' | 'multiply' | 'divide';

export interface GateItem {
  id: string;
  distance: number; // distance at which gate appears (0 to level length)
  leftOp: MathOp;
  leftVal: number;
  rightOp: MathOp;
  rightVal: number;
}

export interface EnemyItem {
  id: string;
  distance: number; // distance along track
  lane: 'left' | 'center' | 'right';
  maxHp: number;
  hp: number;
}

export interface BossInfo {
  id: string;
  name: string;
  maxHp: number;
  hp: number;
  rescueMessage: string;
  buddyName: string; // rescued animal name
  buddyIcon: string;
}

export interface LevelData {
  id: string;
  name: string;
  description: string;
  length: number; // total runway length (e.g. 2000 meters)
  carrotsReward: number;
  gemsReward: number;
  gates: GateItem[];
  enemies: EnemyItem[];
  boss: BossInfo;
  unlockedCharacter: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  levelId: string;
  score: number;
  date: string;
}

// Runtime Game States
export type GameScreen = 'loading' | 'menu' | 'level_select' | 'upgrade' | 'gameplay' | 'victory' | 'defeat';

export interface GameStats {
  score: number;
  carrotsEarned: number;
  miniBossHp: number;
  miniBossMaxHp: number;
  distanceCovered: number;
  totalDistance: number;
}
