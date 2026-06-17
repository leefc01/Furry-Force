/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Shield, Volume2, VolumeX, Sparkles, AlertCircle } from 'lucide-react';
import { SaveData } from '../types';
import { AudioSystem } from '../utils/audio';

interface MainMenuProps {
  saveData: SaveData;
  onNavigate: (screen: 'level_select' | 'upgrade') => void;
  muteState: boolean;
  onToggleMute: () => void;
}

export default function MainMenu({ saveData, onNavigate, muteState, onToggleMute }: MainMenuProps) {
  const handlePlayClick = (screen: 'level_select' | 'upgrade') => {
    AudioSystem.playClick();
    onNavigate(screen);
  };

  // Check how many mini-bosses have been unlocked/completed
  const rescuedBuddiesCount = saveData.completedLevels.length;

  return (
    <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col justify-between p-8 select-none font-sans overflow-hidden">
      {/* Immersive background aura */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a3a4a]/40 via-[#1b271b]/20 to-[#0a0a0a]"></div>

      {/* Grid Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      {/* Top HUD: Stats */}
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3 bg-black/50 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
          <div className="w-8 h-8 rounded-full bg-amber-500 border border-amber-300 flex items-center justify-center text-sm">🐶</div>
          <div>
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">RESCUE FORCE</div>
            <div className="text-xs font-bold text-white">Dog Hero (Leader)</div>
          </div>
        </div>

        {/* Currency displays */}
        <div className="flex gap-3 relative z-10">
          <div className="flex items-center gap-2 bg-black/50 border border-white/10 px-3 py-1.5 rounded-xl">
            <span className="text-sm">🥕</span>
            <span className="text-sm font-black text-amber-400 tabular-nums">{saveData.carrots}</span>
          </div>
          <div className="flex items-center gap-2 bg-black/50 border border-white/10 px-3 py-1.5 rounded-xl">
            <span className="text-sm">💎</span>
            <span className="text-sm font-black text-purple-400 tabular-nums">{saveData.gems}</span>
          </div>
        </div>
      </div>

      {/* Center Body: Title & Mascot */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="relative mb-6">
          {/* Friendly Dog Hero */}
          <div className="relative">
            <div className="w-24 h-24 bg-amber-500 rounded-[32px] border-4 border-amber-300 shadow-2xl relative flex items-center justify-center">
              {/* Ears */}
              <div className="absolute -top-3 -left-2 w-6 h-10 bg-amber-600 rounded-full rotate-[-20deg]"></div>
              <div className="absolute -top-3 -right-2 w-6 h-10 bg-amber-600 rounded-full rotate-[20deg]"></div>
              {/* Eyes */}
              <div className="absolute top-5 left-5 w-2.5 h-2.5 bg-black rounded-full"></div>
              <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-black rounded-full"></div>
              {/* Smile / Nose */}
              <div className="absolute top-9 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-3 h-2 bg-black rounded-full"></div>
                <div className="w-4 h-2 border-b-2 border-black rounded-b-full"></div>
              </div>
              {/* Cape */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-28 h-12 bg-red-600 rounded-lg -z-10 opacity-95"></div>
              {/* Medal */}
              <div className="absolute bottom-2 bg-yellow-400 text-[8px] px-1.5 rounded-full text-black font-black font-mono">STAR</div>
            </div>
            <div className="absolute -bottom-3 w-full h-3 bg-black/40 blur-sm rounded-full"></div>
          </div>
        </div>

        {/* Brand/Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-black font-display tracking-tighter text-white uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            Furry Force
          </h1>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4ade80]/10 border border-[#4ade80]/30 rounded-full text-[#4ade80] text-xs font-black uppercase tracking-widest mt-2 shadow-[0_0_15px_rgba(74,222,128,0.15)]">
            <Sparkles className="w-3.5 h-3.5" />
            Tails of Valor
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Actions Button Columns */}
        <div className="w-full max-w-sm flex flex-col gap-3">
          <button
            onClick={() => handlePlayClick('level_select')}
            className="w-full group py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-lg rounded-2xl border-2 border-amber-300 shadow-[0_4px_25px_rgba(245,158,11,0.3)] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-200"></div>
            <Play className="w-5 h-5 fill-current" />
            RESCUE MISSIONS
          </button>

          <button
            onClick={() => handlePlayClick('upgrade')}
            className="w-full group py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm tracking-wider rounded-2xl border border-white/10 hover:border-white/20 shadow-[0_4px_15px_rgba(0,0,0,0.5)] transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4 text-amber-500" />
            POWER UP HERO (UPGRADES)
          </button>
        </div>
      </div>

      {/* Bottom bar & Settings */}
      <div className="flex justify-between items-end relative z-10 mt-4">
        {/* Story Summary mini-banner */}
        <div className="flex items-center gap-2 text-zinc-500 font-mono text-[9px] uppercase tracking-wider bg-black/30 border border-white/5 py-1.5 px-3 rounded-xl max-w-xs md:max-w-md">
          <AlertCircle className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
          <span>MISSION STATUS: {rescuedBuddiesCount} of 3 corrupted critters saved.</span>
        </div>

        {/* Audio Mute button */}
        <button
          onClick={() => {
            AudioSystem.toggleMute();
            onToggleMute();
          }}
          className="p-3 bg-zinc-900 border border-white/10 rounded-2xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer relative"
        >
          {muteState ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-[#4ade80]" />}
        </button>
      </div>

      {/* Aesthetic Watermarks */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 rotate-[-90deg] origin-left opacity-20 text-[10px] tracking-[0.4em] uppercase font-mono">
        Furry_Force_Engine_v0.1.0_MVP
      </div>
      <div className="absolute right-4 top-1/2 translate-y-1/2 rotate-[90deg] origin-right opacity-20 text-[10px] tracking-[0.4em] uppercase font-mono">
        Render_Mode_2.5D_Perspective
      </div>
    </div>
  );
}
