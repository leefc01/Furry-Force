/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Play, Lock, CheckCircle2, Star, Sparkles } from 'lucide-react';
import { SaveData, LevelData } from '../types';
import { LEVELS } from '../levels';
import { AudioSystem } from '../utils/audio';

interface LevelSelectProps {
  saveData: SaveData;
  onSelectLevel: (level: LevelData) => void;
  onBack: () => void;
}

export default function LevelSelect({ saveData, onSelectLevel, onBack }: LevelSelectProps) {
  const handleLevelClick = (level: LevelData, isLocked: boolean) => {
    if (isLocked) {
      // Shhh play a low block sound
      AudioSystem.playClick();
      return;
    }
    AudioSystem.playClick();
    onSelectLevel(level);
  };

  const handleBack = () => {
    AudioSystem.playClick();
    onBack();
  };

  return (
    <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col justify-between p-8 select-none font-sans overflow-hidden">
      {/* Immersive background aura */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a3a4a]/35 via-[#0f2518]/20 to-[#0a0a0a]"></div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* Top Bar Navigation */}
      <div className="flex justify-between items-center relative z-10">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-2xl border border-white/5 cursor-pointer font-bold text-xs uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          MAIN MENU
        </button>

        <div className="text-right">
          <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono">RESCUE OPERATION</div>
          <h2 className="text-xl md:text-2xl font-black font-display text-white">SELECT MISSION</h2>
        </div>
      </div>

      {/* Main Levels Grid Area */}
      <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full relative z-10 my-4 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LEVELS.map((level, i) => {
            // Unlocked if first level or if the previous level is in completedLevels
            const isUnlocked = i === 0 || saveData.completedLevels.includes(LEVELS[i - 1].id);
            const isCompleted = saveData.completedLevels.includes(level.id);
            const highScore = saveData.highScores[level.id] || 0;

            return (
              <div
                key={level.id}
                onClick={() => handleLevelClick(level, !isUnlocked)}
                className={`group rounded-2xl relative border flex flex-col justify-between p-6 transition-all duration-300 transform select-none ${
                  isUnlocked
                    ? 'bg-black/50 border-white/10 hover:border-[#4ade80]/50 hover:bg-[#4ade80]/5 shadow-xl hover:shadow-[0_10px_30px_rgba(74,222,128,0.1)] hover:-translate-y-1 cursor-pointer'
                    : 'bg-black/20 border-white/5 opacity-40 cursor-not-allowed'
                }`}
              >
                {/* Visual Accent Corner lines */}
                {isUnlocked && (
                  <div className="absolute top-2 right-2 p-1.5 rounded-full bg-white/5 border border-white/5 group-hover:border-[#4ade80]/30 transition-all">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-zinc-500" />
                    )}
                  </div>
                )}

                <div>
                  {/* Badge */}
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <span className="text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase">
                      ZONE_0{i + 1}
                    </span>
                    {isCompleted && (
                      <span className="text-[9px] font-mono font-bold text-[#4ade80] uppercase tracking-wider">
                        CLEARED
                      </span>
                    )}
                  </div>

                  {/* Level title */}
                  <h3 className="text-lg font-black font-display text-white group-hover:text-[#4ade80] transition-colors leading-tight">
                    {level.name.split(': ')[1] || level.name}
                  </h3>

                  {/* Description */}
                  <p className="text-zinc-400 text-xs mt-2 leading-relaxed font-medium line-clamp-3">
                    {level.description}
                  </p>
                </div>

                {/* Level details & targets */}
                <div className="mt-6 pt-4 border-t border-white/5 space-y-3 font-medium">
                  {/* Boss Target Info */}
                  <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">Target Critter:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{level.boss.buddyIcon}</span>
                      <span className="text-xs font-black text-white">{level.boss.buddyName}</span>
                    </div>
                  </div>

                  {/* Level High Score */}
                  {highScore > 0 && (
                    <div className="flex justify-between items-center text-xs text-amber-400 font-mono">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current text-amber-500" /> High Score:
                      </span>
                      <span className="font-bold tabular-nums">{highScore}</span>
                    </div>
                  )}

                  {/* Rewards Row */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">Rewards:</span>
                    <div className="flex items-center gap-3 font-black">
                      <span className="text-orange-400 flex items-center gap-1 tabular-nums">
                        🥕 {level.carrotsReward}
                      </span>
                      <span className="text-purple-400 flex items-center gap-1 tabular-nums">
                        💎 {level.gemsReward}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Launch Button / Lock Overlay */}
                <div className="mt-5">
                  {isUnlocked ? (
                    <button className="w-full py-2.5 bg-[#4ade80] group-hover:bg-[#3bf17a] text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      DEPLOY HERO
                    </button>
                  ) : (
                    <div className="w-full py-2.5 bg-zinc-900 border border-white/5 text-zinc-500 font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      LOCKED SYSTEM
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tactical Status Bar */}
      <div className="flex justify-between items-center z-10 border-t border-white/5 pt-4 text-zinc-500 font-mono text-[9px] uppercase tracking-widest">
        <span>STRATEGY: RECALL HERO OR POWER-UP SHIELDS FOR ZONE LEVELING</span>
        <span className="flex items-center gap-1 text-[#4ade80]">
          <Sparkles className="w-3 h-3" /> DIRECT PERSPECTIVE_ACTIVE
        </span>
      </div>
    </div>
  );
}
