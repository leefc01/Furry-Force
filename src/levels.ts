/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelData } from './types';

export const LEVELS: LevelData[] = [
  {
    id: 'level_1',
    name: 'Level 1: The Corrupted Park',
    description: 'Rogue mechanical squirrels have taken over the park! Free Dexter the Fox from the corruption node.',
    length: 1000,
    carrotsReward: 100,
    gemsReward: 3,
    unlockedCharacter: 'Dexter Fox',
    gates: [
      { id: 'g1_1', distance: 200, leftOp: 'add', leftVal: 5, rightOp: 'add', rightVal: 8 },
      { id: 'g1_2', distance: 400, leftOp: 'multiply', leftVal: 2, rightOp: 'add', rightVal: 10 },
      { id: 'g1_3', distance: 600, leftOp: 'subtract', leftVal: 3, rightOp: 'add', rightVal: 15 },
      { id: 'g1_4', distance: 800, leftOp: 'multiply', leftVal: 3, rightOp: 'divide', rightVal: 2 },
    ],
    enemies: [
      { id: 'e1_1', distance: 100, lane: 'center', maxHp: 30, hp: 30 },
      { id: 'e1_2', distance: 280, lane: 'left', maxHp: 40, hp: 40 },
      { id: 'e1_3', distance: 350, lane: 'right', maxHp: 40, hp: 40 },
      { id: 'e1_4', distance: 500, lane: 'center', maxHp: 50, hp: 50 },
      { id: 'e1_5', distance: 700, lane: 'left', maxHp: 60, hp: 60 },
      { id: 'e1_6', distance: 900, lane: 'right', maxHp: 70, hp: 70 },
    ],
    boss: {
      id: 'boss_1',
      name: 'Corrupted Dexter Fox',
      maxHp: 400,
      hp: 400,
      rescueMessage: 'The dark server connection severed! Dexter shakes his tail happily and joins your rescue alliance!',
      buddyName: 'Dexter Fox',
      buddyIcon: '🦊',
    },
  },
  {
    id: 'level_2',
    name: 'Level 2: The Gridlock Station',
    description: 'Navigate through complex signals to rescue Pudge the Panda, trapped by heavy industrial frequency interference.',
    length: 1200,
    carrotsReward: 200,
    gemsReward: 5,
    unlockedCharacter: 'Pudge Panda',
    gates: [
      { id: 'g2_1', distance: 150, leftOp: 'add', leftVal: 12, rightOp: 'subtract', rightVal: 5 },
      { id: 'g2_2', distance: 350, leftOp: 'multiply', leftVal: 3, rightOp: 'multiply', rightVal: 2 },
      { id: 'g2_3', distance: 550, leftOp: 'divide', leftVal: 2, rightOp: 'add', rightVal: 20 },
      { id: 'g2_4', distance: 750, leftOp: 'multiply', leftVal: 4, rightOp: 'subtract', rightVal: 15 },
      { id: 'g2_5', distance: 1000, leftOp: 'add', leftVal: 30, rightOp: 'divide', rightVal: 3 },
    ],
    enemies: [
      { id: 'e2_1', distance: 80, lane: 'left', maxHp: 50, hp: 50 },
      { id: 'e2_2', distance: 250, lane: 'right', maxHp: 70, hp: 70 },
      { id: 'e2_3', distance: 480, lane: 'center', maxHp: 80, hp: 80 },
      { id: 'e2_4', distance: 680, lane: 'left', maxHp: 100, hp: 100 },
      { id: 'e2_5', distance: 850, lane: 'right', maxHp: 120, hp: 120 },
      { id: 'e2_6', distance: 1100, lane: 'center', maxHp: 150, hp: 150 },
    ],
    boss: {
      id: 'boss_2',
      name: 'Corrupted Pudge Panda',
      maxHp: 800,
      hp: 800,
      rescueMessage: 'Pudge is cured! He rubs his belly, chomps on a bamboo shoot, and offers heavy tech support!',
      buddyName: 'Pudge Panda',
      buddyIcon: '🐼',
    },
  },
  {
    id: 'level_3',
    name: 'Level 3: The High Tech Hive',
    description: 'The master corruption is thick here! Break through standard defenses to rescue Olivia the Owl, an expert tactician.',
    length: 1500,
    carrotsReward: 350,
    gemsReward: 10,
    unlockedCharacter: 'Olivia Owl',
    gates: [
      { id: 'g3_1', distance: 200, leftOp: 'multiply', leftVal: 3, rightOp: 'add', rightVal: 25 },
      { id: 'g3_2', distance: 400, leftOp: 'subtract', leftVal: 10, rightOp: 'add', rightVal: 40 },
      { id: 'g3_3', distance: 650, leftOp: 'divide', leftVal: 2, rightOp: 'multiply', rightVal: 4 },
      { id: 'g3_4', distance: 900, leftOp: 'multiply', leftVal: 5, rightOp: 'subtract', rightVal: 30 },
      { id: 'g3_5', distance: 1150, leftOp: 'add', leftVal: 100, rightOp: 'divide', rightVal: 4 },
      { id: 'g3_6', distance: 1350, leftOp: 'multiply', leftVal: 4, rightOp: 'multiply', rightVal: 3 },
    ],
    enemies: [
      { id: 'e3_1', distance: 100, lane: 'right', maxHp: 90, hp: 90 },
      { id: 'e3_2', distance: 300, lane: 'center', maxHp: 110, hp: 110 },
      { id: 'e3_3', distance: 550, lane: 'left', maxHp: 140, hp: 140 },
      { id: 'e3_4', distance: 800, lane: 'right', maxHp: 180, hp: 180 },
      { id: 'e3_5', distance: 1050, lane: 'left', maxHp: 220, hp: 220 },
      { id: 'e3_6', distance: 1250, lane: 'center', maxHp: 260, hp: 260 },
      { id: 'e3_7', distance: 1420, lane: 'right', maxHp: 300, hp: 300 },
    ],
    boss: {
      id: 'boss_3',
      name: 'Corrupted Olivia Owl',
      maxHp: 1600,
      hp: 1600,
      rescueMessage: 'Olivia flaps her wings as the heavy static clears! She hoots with absolute gratitude and maps out the path ahead!',
      buddyName: 'Olivia Owl',
      buddyIcon: '🦉',
    },
  },
];
