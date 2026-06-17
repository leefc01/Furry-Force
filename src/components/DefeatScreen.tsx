/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Skull, AlertTriangle, ArrowLeft, Shield } from 'lucide-react';
import { LevelData } from '../types';
import { AudioSystem } from '../utils/audio';

interface DefeatScreenProps {
  level: LevelData;
  score: number;
  onRetry: () => void;
  onReturnToSelect: () => void;
  onNavigateToUpgrades: () => void;
}

export default function DefeatScreen({
  level,
  score,
  onRetry,
  onReturnToSelect,
  onNavigateToUpgrades,
}: DefeatScreenProps) {

  const handleAction = (callback: () => void) => {
    AudioSystem.playClick();
    callback();
  };

  return (
    <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col justify-between p-8 select-none font-sans overflow-hidden">
      {/* Immersive red atmosphere visual wrapper */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a1313]/55 via-[#1a0a0a]/30 to-[#0a0a0a]"></div>

      {/* Grid line overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 max-w-lg mx-auto w-full">
        {/* Animated skull head */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-b from-red-600 to-red-800 rounded-3xl border-4 border-red-500 flex items-center justify-center shadow-[0_0_45px_rgba(239,68,68,0.5)] animate-bounce">
            <Skull className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1.5 border-2 border-white">
            <AlertTriangle className="w-3.5 h-3.5 text-black fill-current" />
          </div>
        </div>

        {/* Failed title headers */}
        <div className="text-center mb-6">
          <span className="text-red-500 font-mono text-[10px] font-bold uppercase tracking-[0.25em]">MISSION FAILED</span>
          <h2 className="text-3xl md:text-4xl font-black font-display text-white uppercase mt-1">
            SHIELD CRITICAL
          </h2>
          <p className="text-zinc-400 text-xs mt-2.5 font-semibold">
            Rogue squirrel networks overwhelmed Dog Hero's nano-shielding system.
          </p>
        </div>

        {/* Friendly motivational tip */}
        <div className="w-full bg-white/5 border border-red-900/30 rounded-2xl p-4.5 mb-6 text-center select-none backdrop-blur-md">
          <span className="text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider block mb-1">
            DOG HEALTH WARNING:
          </span>
          <p className="text-zinc-300 text-xs italic font-medium leading-relaxed">
            "Your starting health and power might be too low! Spend your harvested Carrots in the Power Lab to buy extra Nano-Shield HP and Initial star-power."
          </p>
        </div>

        {/* Failed details card summary */}
        <div className="w-full bg-black/50 border border-white/5 rounded-2xl p-5 mb-8 space-y-3.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-bold uppercase tracking-wider">Mission Target:</span>
            <span className="font-bold text-white uppercase">{level.name.split(': ')[1]}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-bold uppercase tracking-wider">High Score:</span>
            <span className="font-bold text-white font-mono tabular-nums">{score}</span>
          </div>
        </div>

        {/* Action Button Grid */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => handleAction(onRetry)}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl border border-red-400 shadow-[0_4px_25px_rgba(239,68,68,0.35)] transition-all cursor-pointer"
          >
            RE-DEPLOY HERO (RETRY)
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAction(onReturnToSelect)}
              className="py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              MAP SELECT
            </button>

            <button
              onClick={() => handleAction(onNavigateToUpgrades)}
              className="py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
            >
              <Shield className="w-3.5 h-3.5 fill-current" />
              POWER LABS
            </button>
          </div>
        </div>
      </div>

      {/* Standard footnote */}
      <div className="flex justify-between items-center text-zinc-500 font-mono text-[9px] uppercase tracking-widest z-10 border-t border-white/5 pt-4">
        <span>STRATEGY: MEMORIZE OBSTACLE COORDINATES AND SLIDE LANE EXPEDIENTLY</span>
        <span>STATUS: POWER_LABS_DISPATCH_ON_LINE</span>
      </div>
    </div>
  );
}
