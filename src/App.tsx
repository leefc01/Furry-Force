/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SaveData, GameScreen, LevelData } from './types';
import { SaveProvider } from './save';
import LoadingScreen from './components/LoadingScreen';
import MainMenu from './components/MainMenu';
import LevelSelect from './components/LevelSelect';
import UpgradeScreen from './components/UpgradeScreen';
import GamePlay from './components/GamePlay';
import VictoryScreen from './components/VictoryScreen';
import DefeatScreen from './components/DefeatScreen';
import { LEVELS } from './levels';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('loading');
  const [saveData, setSaveData] = useState<SaveData>(SaveProvider.load);
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Result stats from gameplay
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionCarrots, setSessionCarrots] = useState(0);
  const [sessionGems, setSessionGems] = useState(0);

  // Synchronize audio mute state across views
  const handleToggleMute = () => {
    setIsMuted(SaveProvider.load !== undefined);
  };

  // Process a level victory
  const handleVictory = (finalScore: number, carrotsEarned: number, gemsEarned: number) => {
    if (!selectedLevel) return;

    setSessionScore(finalScore);
    setSessionCarrots(carrotsEarned);
    setSessionGems(gemsEarned);

    // Update Persistent Save
    const completed = [...saveData.completedLevels];
    if (!completed.includes(selectedLevel.id)) {
      completed.push(selectedLevel.id);
    }

    const currentHighScore = saveData.highScores[selectedLevel.id] || 0;
    const highScores = {
      ...saveData.highScores,
      [selectedLevel.id]: Math.max(currentHighScore, finalScore),
    };

    const updatedSave: SaveData = {
      ...saveData,
      carrots: saveData.carrots + carrotsEarned,
      gems: saveData.gems + gemsEarned,
      completedLevels: completed,
      highScores,
    };

    SaveProvider.save(updatedSave);
    setSaveData(updatedSave);
    setScreen('victory');
  };

  // Process a level defeat
  const handleDefeat = (finalScore: number) => {
    if (!selectedLevel) return;

    // Award player whatever carrots they collected during track run as partial payout!
    // We let them keep 30% or 50% for trying, or just what they harvested before dying. Let's give them what they harvested before!
    // In our gameplay, carrots Collected is calculated and we can pass it down.
    setSessionScore(finalScore);
    setScreen('defeat');
  };

  return (
    <div className="relative w-full h-[768px] max-w-[1024px] mx-auto bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/5 shadow-2xl font-sans text-white select-none my-auto">
      {screen === 'loading' && (
        <LoadingScreen onComplete={() => setScreen('menu')} />
      )}

      {screen === 'menu' && (
        <MainMenu
          saveData={saveData}
          onNavigate={(next) => setScreen(next)}
          muteState={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'level_select' && (
        <LevelSelect
          saveData={saveData}
          onSelectLevel={(level) => {
            setSelectedLevel(level);
            setScreen('gameplay');
          }}
          onBack={() => setScreen('menu')}
        />
      )}

      {screen === 'upgrade' && (
        <UpgradeScreen
          saveData={saveData}
          onUpdateSave={(newData) => setSaveData(newData)}
          onBack={() => setScreen('menu')}
        />
      )}

      {screen === 'gameplay' && selectedLevel && (
        <GamePlay
          level={selectedLevel}
          saveData={saveData}
          onVictory={handleVictory}
          onDefeat={handleDefeat}
          onQuit={() => setScreen('level_select')}
        />
      )}

      {screen === 'victory' && selectedLevel && (
        <VictoryScreen
          level={selectedLevel}
          score={sessionScore}
          carrotsEarned={sessionCarrots}
          gemsEarned={sessionGems}
          onNextLevel={
            // Find next level if any is available
            (() => {
              const idx = LEVELS.findIndex((l) => l.id === selectedLevel.id);
              if (idx !== -1 && idx < LEVELS.length - 1) {
                const nextLvl = LEVELS[idx + 1];
                return () => {
                  setSelectedLevel(nextLvl);
                  setScreen('gameplay');
                };
              }
              return undefined;
            })()
          }
          onReturnToSelect={() => setScreen('level_select')}
          onNavigateToUpgrades={() => setScreen('upgrade')}
        />
      )}

      {screen === 'defeat' && selectedLevel && (
        <DefeatScreen
          level={selectedLevel}
          score={sessionScore}
          onRetry={() => setScreen('gameplay')}
          onReturnToSelect={() => setScreen('level_select')}
          onNavigateToUpgrades={() => setScreen('upgrade')}
        />
      )}
    </div>
  );
}
