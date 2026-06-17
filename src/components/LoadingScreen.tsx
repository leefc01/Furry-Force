/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Shield, Zap, Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const HINTS = [
  "Move left and right using A/D keys or by clicking on the left/right sides of the road!",
  "Avoid division (÷) and subtraction (-) gates — they drain your combat power!",
  "Earn cute golden Carrots by defeating rogue robot squirrels!",
  "Use your accumulated power to shatter the mini-boss corruption shield!",
  "Upgrading initial damage increases your starting power in every level!",
  "More animal heroes will join the Furry Force as you rescue them!"
];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [hint, setHint] = useState("");

  useEffect(() => {
    setHint(HINTS[Math.floor(Math.random() * HINTS.length)]);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + Math.floor(Math.random() * 8) + 4;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col justify-between p-8 select-none font-sans overflow-hidden">
      {/* Immersive background aura */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a3a4a]/20 via-transparent to-[#0a0a0a]"></div>
      
      {/* Geometric grid design item */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 rotate-[90deg] origin-right opacity-20 text-[10px] tracking-[0.4em] uppercase font-mono">
        Furry_Force_Engine_v0.1.0_MVP
      </div>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 rotate-[-90deg] origin-left opacity-20 text-[10px] tracking-[0.4em] uppercase font-mono">
        Loading_Resource_Bundles...
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {/* Animated Emblem */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-3xl bg-amber-500 border-4 border-amber-300 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.4)] animate-bounce">
            <span className="text-5xl">🐶</span>
          </div>
          <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2 border-2 border-white animate-pulse">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="absolute -bottom-2 -left-2 bg-[#4ade80] rounded-full p-2 border-2 border-white">
            <Zap className="w-4 h-4 text-black" />
          </div>
        </div>

        {/* Game Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
            Furry Force
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-300 text-xs font-bold uppercase tracking-widest mt-2">
            <Sparkles className="w-3_h-3 text-amber-400" />
            Tails of Valor
            <Sparkles className="w-3_h-3 text-amber-400" />
          </div>
        </div>

        {/* Progress bar container */}
        <div className="w-full max-w-md bg-zinc-900 border border-white/10 p-1.5 rounded-full mb-4 shadow-inner relative overflow-hidden">
          <div 
            className="h-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-[#4ade80] transition-all duration-100 shadow-[0_0_12px_#4ade80]"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>

        <div className="text-zinc-500 text-xs font-mono font-bold tracking-wider">
          LOADING SYSTEMS... {Math.min(progress, 100)}%
        </div>
      </div>

      {/* Dynamic Hint */}
      <div className="w-full max-w-lg mx-auto bg-black/40 backdrop-blur-md border border-white/5 p-4 rounded-2xl relative z-10 text-center">
        <div className="text-amber-400 text-xxs font-mono uppercase tracking-widest mb-1.5 font-bold">Dog Hero Hint:</div>
        <p className="text-zinc-300 text-xs italic font-medium leading-relaxed">
          "{hint}"
        </p>
      </div>
    </div>
  );
}
