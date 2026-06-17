/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Shield, Zap, Sparkles, AlertCircle } from 'lucide-react';
import { SaveData, UpgradeType } from '../types';
import { SaveProvider, UPGRADES_CONFIG } from '../save';
import { AudioSystem } from '../utils/audio';

interface UpgradeScreenProps {
  saveData: SaveData;
  onUpdateSave: (newData: SaveData) => void;
  onBack: () => void;
}

export default function UpgradeScreen({ saveData, onUpdateSave, onBack }: UpgradeScreenProps) {
  const [activeTab, setActiveTab] = useState<'health' | 'damage' | 'multiplier'>('health');
  const [flashSuccess, setFlashSuccess] = useState(false);

  const handleBack = () => {
    AudioSystem.playClick();
    onBack();
  };

  const handleUpgrade = (id: 'health' | 'damage' | 'multiplier') => {
    const currentLevel = saveData.upgrades[id];
    const config = UPGRADES_CONFIG[id];

    if (currentLevel >= config.maxLevel) {
      AudioSystem.playClick();
      return;
    }

    const cost = SaveProvider.getUpgradeCost(id, currentLevel);
    if (saveData.carrots < cost) {
      // Invariant: not enough carrots
      AudioSystem.playClick();
      return;
    }

    // Process Upgrade
    const updatedCarrots = saveData.carrots - cost;
    const nextLevel = currentLevel + 1;

    const newSave: SaveData = {
      ...saveData,
      carrots: updatedCarrots,
      upgrades: {
        ...saveData.upgrades,
        [id]: nextLevel,
      },
    };

    SaveProvider.save(newSave);
    onUpdateSave(newSave);

    // Audio chime & visual flash
    AudioSystem.playGate();
    setFlashSuccess(true);
    setTimeout(() => {
      setFlashSuccess(false);
    }, 800);
  };

  const currentLevels = saveData.upgrades;

  return (
    <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col justify-between p-8 select-none font-sans overflow-hidden">
      {/* Immersive background atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a3a4a]/30 via-[#271b1b]/20 to-[#0a0a0a]"></div>

      {/* Grid line background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      {/* Top Bar Navigation */}
      <div className="flex justify-between items-center relative z-10">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-2xl border border-white/5 cursor-pointer font-bold text-xs uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          MAIN MENU
        </button>

        {/* Currency balances */}
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-black/60 border border-white/10 px-4 py-1.5 rounded-2xl backdrop-blur-md">
            <span className="text-base">🥕</span>
            <span className="text-lg font-black text-amber-400 tabular-nums">{saveData.carrots}</span>
          </div>
          <div className="flex items-center gap-2 bg-black/60 border border-white/10 px-4 py-1.5 rounded-2xl backdrop-blur-md">
            <span className="text-base">💎</span>
            <span className="text-lg font-black text-purple-400 tabular-nums">{saveData.gems}</span>
          </div>
        </div>
      </div>

      {/* Main Upgrades UI Component */}
      <div className="flex-1 max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10 my-4">
        
        {/* Left Side: Category Navigator List (5 columns) */}
        <div className="md:col-span-5 flex flex-col gap-3 h-full justify-center">
          <div className="text-left mb-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">DOG HERO LAB</span>
            <h2 className="text-2xl font-black font-display text-white">UPGRADES HUB</h2>
          </div>

          {(['health', 'damage', 'multiplier'] as const).map((id) => {
            const config = UPGRADES_CONFIG[id];
            const lvl = currentLevels[id];
            const isMax = lvl >= config.maxLevel;
            const cost = SaveProvider.getUpgradeCost(id, lvl);
            const canAfford = saveData.carrots >= cost;

            const iconClass = id === 'health' 
              ? 'text-red-400 border-red-500/20 bg-red-500/5' 
              : id === 'damage' 
                ? 'text-amber-400 border-amber-500/20 bg-amber-500/5'
                : 'text-[#4ade80] border-[#4ade80]/20 bg-[#4ade80]/5';

            return (
              <div
                key={id}
                onClick={() => {
                  AudioSystem.playClick();
                  setActiveTab(id);
                }}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                  activeTab === id
                    ? 'bg-white/10 border-amber-500/50 shadow-[0_4px_20px_rgba(245,158,11,0.15)] scale-[1.01]'
                    : 'bg-black/40 border-white/10 hover:bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-sm ${iconClass}`}>
                    {id === 'health' ? <Shield className="w-5 h-5 text-red-500" /> : id === 'damage' ? <Zap className="w-5 h-5 text-amber-400" /> : <Sparkles className="w-5 h-5 text-[#4ade80]" />}
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-white">{config.name}</h4>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold">
                      LV {lvl} / {config.maxLevel}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  {isMax ? (
                    <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded font-mono">MAX</span>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className={`text-xs font-black tabular-nums font-mono ${canAfford ? 'text-amber-400' : 'text-zinc-500'}`}>
                        🥕 {cost}
                      </span>
                      <span className="text-[8px] font-mono text-zinc-500 font-bold uppercase">UPGRADE</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Detailed Workbench Card (7 columns) */}
        <div className="md:col-span-7 bg-black/60 border border-white/10 rounded-3xl p-6 h-full flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
          {flashSuccess && (
            <div className="absolute inset-0 bg-[#4ade80]/15 border-2 border-[#4ade80] rounded-3xl z-20 pointer-events-none flex items-center justify-center animate-pulse">
              <div className="text-[#4ade80] font-black text-xl flex items-center gap-2 bg-black/90 px-6 py-3 rounded-2xl border border-[#4ade80]/30 shadow-2xl">
                <Sparkles className="w-5 h-5" /> RE-CALIBRATED!
              </div>
            </div>
          )}

          {/* Details header */}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[#4ade80] font-mono text-[9px] font-bold uppercase tracking-widest bg-[#4ade80]/10 px-2.5 py-1 rounded-full">
                  ACTIVE_COMPILER
                </span>
                <h3 className="text-2xl font-black font-display text-white mt-1.5">
                  {UPGRADES_CONFIG[activeTab].name}
                </h3>
              </div>
              <div className="text-3xl">
                {activeTab === 'health' ? '❤️' : activeTab === 'damage' ? '⚡' : '🥕'}
              </div>
            </div>

            <p className="text-zinc-300 text-xs leading-relaxed font-semibold">
              {UPGRADES_CONFIG[activeTab].description}
            </p>

            {/* Spec breakdown */}
            <div className="grid grid-cols-2 gap-4 mt-4 bg-white/5 border border-white/5 p-4 rounded-2xl">
              <div>
                <div className="text-zinc-500 text-[10px] font-mono font-bold uppercase tracking-wider">CURRENT VALUE</div>
                <div className="text-xl font-black text-white font-mono mt-1">
                  {activeTab === 'health' 
                    ? `${SaveProvider.getHealthValue(currentLevels.health)} HP` 
                    : activeTab === 'damage' 
                      ? `${SaveProvider.getDamageValue(currentLevels.damage)} Projectile Dmg` 
                      : `x${SaveProvider.getMultiplierValue(currentLevels.multiplier).toFixed(1)} Extra Carrots`
                  }
                </div>
              </div>

              <div>
                <div className="text-[#4ade80] text-[10px] font-mono font-bold uppercase tracking-wider">NEXT LEVEL VALUE</div>
                <div className="text-xl font-black text-[#4ade80] font-mono mt-1">
                  {currentLevels[activeTab] >= UPGRADES_CONFIG[activeTab].maxLevel ? (
                    <span className="text-zinc-500">MAXIMUM</span>
                  ) : activeTab === 'health' 
                    ? `${SaveProvider.getHealthValue(currentLevels.health + 1)} HP` 
                    : activeTab === 'damage' 
                      ? `${SaveProvider.getDamageValue(currentLevels.damage + 1)} Projectile Dmg` 
                      : `x${SaveProvider.getMultiplierValue(currentLevels.multiplier + 1).toFixed(1)} Extra Carrots`
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Workbench action */}
          <div className="mt-6 space-y-3">
            {currentLevels[activeTab] >= UPGRADES_CONFIG[activeTab].maxLevel ? (
              <div className="w-full py-4 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-500 font-bold text-center text-xs uppercase letter font-mono">
                COMPETENCY MATRIX INTEGRATION COMPLETED
              </div>
            ) : (
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <div className="text-zinc-500 text-[9px] font-mono font-bold uppercase tracking-wider">REQUIRED COST</div>
                  <div className="text-xl font-black text-amber-400 font-display flex items-center gap-1.5 mt-0.5">
                    <span>🥕 {SaveProvider.getUpgradeCost(activeTab, currentLevels[activeTab])}</span>
                    {saveData.carrots < SaveProvider.getUpgradeCost(activeTab, currentLevels[activeTab]) && (
                      <span className="text-[10px] font-bold text-red-500 font-mono uppercase bg-red-500/10 px-2 py-0.5 rounded">
                        INSUFFICIENT CARROTS
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleUpgrade(activeTab)}
                  disabled={saveData.carrots < SaveProvider.getUpgradeCost(activeTab, currentLevels[activeTab])}
                  className={`px-8 py-3.5 rounded-2xl text-black font-black text-xs uppercase tracking-widest font-mono transition-all duration-200 cursor-pointer ${
                    saveData.carrots >= SaveProvider.getUpgradeCost(activeTab, currentLevels[activeTab])
                      ? 'bg-amber-500 hover:bg-amber-400 shadow-[0_4px_20px_rgba(245,158,11,0.3)] active:scale-95'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                  }`}
                >
                  UPGRADE
                </button>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-zinc-500 text-[9px] font-mono leading-tight uppercase">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <span>UPGRADES ARE IMMEDIATELY STORED AND WILL APPLY TO ALL RESCUE PATHWAYS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Under watermark row */}
      <div className="flex justify-between items-center text-zinc-500 font-mono text-[9px] uppercase tracking-widest z-10 border-t border-white/5 pt-4">
        <span>STRATEGY: FOCUS CAPITAL ON DAMAGE MULTIPLIERS FOR TOUGH BOSS ENCOUNTERS</span>
        <span>NODE LEVEL STATE: STABLE</span>
      </div>
    </div>
  );
}
