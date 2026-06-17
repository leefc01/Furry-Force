/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trophy, ArrowLeft, Shield, Sparkles, Star } from 'lucide-react';
import { LevelData } from '../types';
import { AudioSystem } from '../utils/audio';

interface VictoryScreenProps {
  level: LevelData;
  score: number;
  carrotsEarned: number;
  gemsEarned: number;
  onNextLevel?: () => void;
  onReturnToSelect: () => void;
  onNavigateToUpgrades: () => void;
}

export default function VictoryScreen({
  level,
  score,
  carrotsEarned,
  gemsEarned,
  onNextLevel,
  onReturnToSelect,
  onNavigateToUpgrades,
}: VictoryScreenProps) {

  const handleAction = (callback: () => void) => {
    AudioSystem.playClick();
    callback();
  };

  return (
    <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col justify-between p-8 select-none font-sans overflow-hidden">
      {/* Celebration background auras */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1b2f1b]/40 via-[#132c1e]/15 to-[#0a0a0a]"></div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      {/* Confetti simulation (decorative elements) */}
      <div className="absolute top-[15%] left-[20%] text-2xl animate-bounce">✨</div>
      <div className="absolute top-[25%] right-[25%] text-2xl animate-pulse">🎉</div>
      <div className="absolute top-[45%] left-[10%] text-3xl animate-pulse">🥕</div>
      <div className="absolute top-[40%] right-[10%] text-3xl animate-bounce">🌟</div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 max-w-lg mx-auto w-full">
        {/* Animated Trophy badge */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-b from-yellow-400 to-amber-500 rounded-3xl border-4 border-yellow-300 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.5)] animate-pulse">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 bg-[#4ade80] rounded-full p-1.5 border-2 border-white text-xs font-black">
            V
          </div>
        </div>

        {/* Victory Headers */}
        <div className="text-center mb-6">
          <span className="text-[#4ade80] font-mono text-[10px] font-bold uppercase tracking-[0.25em]">RESCUE COMPLETE</span>
          <h2 className="text-3xl md:text-4xl font-black font-display text-white uppercase mt-1">
            MISSION VICTORIOUS
          </h2>
          <p className="text-zinc-400 text-xs mt-1.5 font-semibold">
            You successfully purged the node holding <span className="text-[#4ade80]">{level.boss.buddyName}</span>!
          </p>
        </div>

        {/* Rescued animal celebration block */}
        <div className="w-full bg-white/5 border border-[#4ade80]/20 rounded-2xl p-4 flex items-center gap-4.5 mb-6 relative overflow-hidden backdrop-blur-md">
          <div className="text-4xl p-3 bg-[#4ade80]/15 rounded-xl border border-[#4ade80]/30 flex items-center justify-center">
            {level.boss.buddyIcon}
          </div>
          <div className="space-y-1">
            <div className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider">NEW ALLIANCE MEMBER</div>
            <h4 className="text-sm font-black text-white">{level.boss.buddyName} Joins!</h4>
            <p className="text-[11px] text-zinc-400 leading-snug">{level.boss.rescueMessage}</p>
          </div>
          <div className="absolute right-3 top-3">
            <Sparkles className="w-4 h-4 text-[#4ade80] animate-spin" />
          </div>
        </div>

        {/* Stat items card */}
        <div className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 mb-8 space-y-3 shadow-inner">
          <div className="flex justify-between items-center pb-2.5 border-b border-white/5 text-xs">
            <span className="text-zinc-500 font-bold uppercase tracking-wider">Mission Target:</span>
            <span className="font-bold text-white uppercase">{level.name.split(': ')[1]}</span>
          </div>

          <div className="flex justify-between items-center pb-2.5 border-b border-white/5 text-xs">
            <span className="text-zinc-500 font-bold uppercase tracking-wider">Accumulated Score:</span>
            <span className="font-black text-amber-400 font-mono text-sm tabular-nums">{score}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-bold uppercase tracking-wider">Rewards Transferred:</span>
            <div className="flex items-center gap-3.5 font-bold font-mono text-sm">
              <span className="text-orange-400 flex items-center gap-1 tabular-nums">
                🥕 +{carrotsEarned}
              </span>
              <span className="text-purple-400 flex items-center gap-1 tabular-nums">
                💎 +{gemsEarned}
              </span>
            </div>
          </div>
        </div>

        {/* Choice of buttons */}
        <div className="w-full flex flex-col gap-3">
          {onNextLevel && (
            <button
              onClick={() => handleAction(onNextLevel)}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs uppercase tracking-widest rounded-2xl border border-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
            >
              LAUNCH NEXT MISSION
            </button>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAction(onReturnToSelect)}
              className="py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              MAP SELECT
            </button>

            <button
              onClick={() => handleAction(onNavigateToUpgrades)}
              className="py-3 bg-[#4ade80] hover:bg-[#3bf17a] text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Shield className="w-3.5 h-3.5 fill-current" />
              POWER LABS
            </button>
          </div>
        </div>
      </div>

      {/* Standard footnote */}
      <div className="flex justify-between items-center text-zinc-500 font-mono text-[9px] uppercase tracking-widest z-10 border-t border-white/5 pt-4">
        <span>STRATEGY: SPEND NEW CARROTS TO HARDEN SHIELD HP FOR HIGHER LEVELS</span>
        <span>STATUS: ACTIVE_GREETINGS</span>
      </div>
    </div>
  );
}
