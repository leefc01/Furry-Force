/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, Shield, Swords, Sparkles, Trophy, Skull } from 'lucide-react';
import { LevelData, SaveData, MathOp } from '../types';
import { SaveProvider } from '../save';
import { AudioSystem } from '../utils/audio';

interface GamePlayProps {
  level: LevelData;
  saveData: SaveData;
  onVictory: (finalScore: number, carrotsEarned: number, gemsEarned: number) => void;
  onDefeat: (finalScore: number) => void;
  onQuit: () => void;
}

interface ActiveLaser {
  id: string;
  lane: 'left' | 'center' | 'right';
  distance: number; // flies forward
}

interface ActiveLaserExplosion {
  id: string;
  lane: 'left' | 'center' | 'right';
  distance: number;
  color: string;
}

interface ActiveBossHazard {
  id: string;
  lane: 'left' | 'center' | 'right';
  distance: number; // moves backward from boss (length) to player (current distance)
}

export default function GamePlay({ level, saveData, onVictory, onDefeat, onQuit }: GamePlayProps) {
  // Max HP and Starting Power based on Upgrades
  const maxHealth = SaveProvider.getHealthValue(saveData.upgrades.health);
  const startingPower = SaveProvider.getDamageValue(saveData.upgrades.damage);
  const carrotMultiplier = SaveProvider.getMultiplierValue(saveData.upgrades.multiplier);

  // Core gameplay states
  const [playerHp, setPlayerHp] = useState(maxHealth);
  const [currentPower, setCurrentPower] = useState(startingPower);
  const [distanceCovered, setDistanceCovered] = useState(0);
  const [currentLane, setCurrentLane] = useState<'left' | 'center' | 'right'>('center');
  const [score, setScore] = useState(0);
  const [carrotsCollected, setCarrotsCollected] = useState(0);
  const [isMuted, setIsMuted] = useState(AudioSystem.getMuted());

  // Entity states (deep copied from LevelData so we can modify HP in place)
  const [enemies, setEnemies] = useState(() => level.enemies.map(e => ({ ...e })));
  const [gatesCleared, setGatesCleared] = useState<Record<string, boolean>>({});
  const [bossHp, setBossHp] = useState(level.boss.maxHp);
  const [isBossPhase, setIsBossPhase] = useState(false);
  const [isBossRescued, setIsBossRescued] = useState(false);

  // Projection lists
  const [lasers, setLasers] = useState<ActiveLaser[]>([]);
  const [explosions, setExplosions] = useState<ActiveLaserExplosion[]>([]);
  const [hazards, setHazards] = useState<ActiveBossHazard[]>([]);

  // Feedback overlays
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const [textIndicator, setTextIndicator] = useState<{ text: string; color: string } | null>(null);

  // References for safe animation loops
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const shootTimerRef = useRef<number>(0);
  const bossAttackTimerRef = useRef<number>(0);

  // Audio mute helper
  const handleToggleMute = () => {
    const muted = AudioSystem.toggleMute();
    setIsMuted(muted);
  };

  // Lane helper mapped to position projection offsets
  const getLaneIndex = (lane: 'left' | 'center' | 'right') => {
    if (lane === 'left') return -1;
    if (lane === 'right') return 1;
    return 0;
  };

  // Steer keys listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (playerHp <= 0 || isBossRescued) return;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        setCurrentLane((prev) => (prev === 'right' ? 'center' : 'left'));
        AudioSystem.playClick();
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        setCurrentLane((prev) => (prev === 'left' ? 'center' : 'right'));
        AudioSystem.playClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerHp, isBossRescued]);

  // Click side input handler for mobile/touch integration
  const handleSideClick = (side: 'left' | 'right') => {
    if (playerHp <= 0 || isBossRescued) return;
    if (side === 'left') {
      setCurrentLane((prev) => (prev === 'right' ? 'center' : 'left'));
    } else {
      setCurrentLane((prev) => (prev === 'left' ? 'center' : 'right'));
    }
    AudioSystem.playClick();
  };

  // Math operation processors
  const applyMathGate = (op: MathOp, val: number) => {
    AudioSystem.playGate();
    let newPower = currentPower;
    let label = '';
    
    switch (op) {
      case 'add':
        newPower += val;
        label = `+${val} POWER!`;
        setFlashColor('rgba(74,222,128,0.2)'); // green flash
        break;
      case 'subtract':
        newPower = Math.max(1, newPower - val);
        label = `-${val} POWER`;
        setFlashColor('rgba(239,68,68,0.2)'); // red flash
        break;
      case 'multiply':
        newPower *= val;
        label = `x${val} STAR POWER!`;
        setFlashColor('rgba(251,191,36,0.3)'); // gold flash
        break;
      case 'divide':
        newPower = Math.max(1, Math.floor(newPower / val));
        label = `÷${val} POWER DAMPEN` ;
        setFlashColor('rgba(239,68,68,0.2)'); // red flash
        break;
    }
    setCurrentPower(newPower);
    setTextIndicator({ text: label, color: op === 'add' || op === 'multiply' ? 'text-[#4ade80]' : 'text-red-500' });
    setTimeout(() => setTextIndicator(null), 1200);
    setTimeout(() => setFlashColor(null), 350);
  };

  // Main simulation tick with frame independent adjustment
  useEffect(() => {
    const gameTick = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }
      const deltaTime = Math.min(100, time - lastTimeRef.current); // safe clamp
      lastTimeRef.current = time;

      // Ensure no further movement if player hp is depleted
      if (playerHp <= 0) {
        onDefeat(score);
        return;
      }

      // Check for level end trigger
      if (distanceCovered >= level.length && !isBossPhase) {
        setIsBossPhase(true);
        setTextIndicator({ text: "CORRUPTED NODE DETECTED! FIGHT!", color: "text-red-500 animate-pulse font-black" });
        setTimeout(() => setTextIndicator(null), 2500);
      }

      // Main Runner Movement
      if (!isBossPhase) {
        // Increase distance covered (approx. 24 meters per second)
        const speed = 0.024 * deltaTime;
        const nextDistance = distanceCovered + speed;
        setDistanceCovered(nextDistance);
        setScore((prev) => prev + Math.floor(speed * 0.5));

        // Gate intersection testing
        level.gates.forEach((gate) => {
          if (!gatesCleared[gate.id] && nextDistance >= gate.distance && distanceCovered < gate.distance) {
            // Mark gate completed
            setGatesCleared((prev) => ({ ...prev, [gate.id]: true }));
            
            // Player splits gate choice based on left vs right half of the track
            if (currentLane === 'left') {
              applyMathGate(gate.leftOp, gate.leftVal);
            } else if (currentLane === 'right') {
              applyMathGate(gate.rightOp, gate.rightVal);
            } else {
              // Center lane choice: let the player pick by leading slightly or favor the positive one
              // Let's take the Left Op if it has better value, or just Left op to keep steer important
              applyMathGate(gate.leftOp, gate.leftVal);
            }
          }
        });

        // Player vs Squirrel Enemy collision check
        setEnemies((prevEnemies) => {
          return prevEnemies.map((enemy) => {
            if (enemy.hp > 0 && nextDistance >= enemy.distance && distanceCovered < enemy.distance) {
              if (enemy.lane === currentLane) {
                // Strike collision!
                setPlayerHp((hp) => {
                  const remaining = Math.max(0, hp - 25);
                  if (remaining <= 0) {
                    AudioSystem.playDefeat();
                  } else {
                    AudioSystem.playEnemyDefeat(); // damage grunt sound
                  }
                  return remaining;
                });
                setFlashColor('rgba(239,68,68,0.4)');
                setTimeout(() => setFlashColor(null), 250);
                setTextIndicator({ text: "SHIELD COLLISION! -25 HP", color: "text-red-500 font-bold" });
                setTimeout(() => setTextIndicator(null), 1200);
                
                // Explode the hit enemy anyway but player takes damage penalty
                return { ...enemy, hp: 0 };
              }
            }
            return enemy;
          });
        });

        // Automatic Shooter Engine (fires laser every 500ms)
        shootTimerRef.current += deltaTime;
        if (shootTimerRef.current >= 500) {
          shootTimerRef.current = 0;
          AudioSystem.playShoot();
          setLasers((prev) => [
            ...prev,
            { id: `las_${Date.now()}_${Math.random()}`, lane: currentLane, distance: nextDistance }
          ]);
        }
      }

      // 1. Process active running lasers flying forward
      setLasers((prevLasers) => {
        const speed = 0.08 * deltaTime; // travels fast
        const updatedLasers: ActiveLaser[] = [];

        prevLasers.forEach((laser) => {
          const nextLaserDist = laser.distance + speed;
          
          // Max range 400m from player's running depth
          if (nextLaserDist - distanceCovered < 400) {
            
            // Check collision with enemies on the same track lane
            let hitRegistered = false;
            setEnemies((currentEnemies) => {
              return currentEnemies.map((enemy) => {
                if (!hitRegistered && enemy.hp > 0 && enemy.lane === laser.lane && 
                    nextLaserDist >= enemy.distance && laser.distance <= enemy.distance) {
                  
                  hitRegistered = true;
                  const newEnemyHp = Math.max(0, enemy.hp - currentPower);
                  
                  // Score & carrot award on elimination
                  if (newEnemyHp <= 0) {
                    AudioSystem.playEnemyDefeat();
                    setScore((s) => s + 100);
                    const carrotYield = Math.round(5 * carrotMultiplier);
                    setCarrotsCollected((c) => c + carrotYield);
                    
                    // Trigger custom cute explosion particle on perspective path
                    setExplosions((exps) => [
                      ...exps,
                      {
                        id: `exp_${Date.now()}_${Math.random()}`,
                        lane: enemy.lane,
                        distance: enemy.distance,
                        color: 'bg-orange-500'
                      }
                    ]);
                  } else {
                    AudioSystem.playClick();
                    // Spark orange target flash
                    setExplosions((exps) => [
                      ...exps,
                      {
                        id: `exp_${Date.now()}_${Math.random()}`,
                        lane: enemy.lane,
                        distance: enemy.distance,
                        color: 'bg-amber-300'
                      }
                    ]);
                  }
                  return { ...enemy, hp: newEnemyHp };
                }
                return enemy;
              });
            });

            // Target collision check for Boss Phase
            if (isBossPhase && !hitRegistered && nextLaserDist >= level.length) {
              hitRegistered = true;
              setBossHp((prevHp) => {
                const updatedHp = Math.max(0, prevHp - currentPower);
                if (updatedHp <= 0 && !isBossRescued) {
                  // Boss is cured!!!
                  setIsBossRescued(true);
                  AudioSystem.playBossRescue();
                  
                  const finalScore = score + 1000;
                  setScore(finalScore);
                  
                  // Big victory carrots reward plus multiplier
                  const victoryCarrots = Math.round(level.carrotsReward * carrotMultiplier);
                  setCarrotsCollected((c) => c + victoryCarrots);
                  
                  setTextIndicator({ text: "CORRUPTION SHATTERED! FOX UNCORRUPTED!", color: "text-[#4ade80] font-black text-2xl animate-bounce" });

                  // End level in a glorious victory after nice 3 second happy pose delay
                  setTimeout(() => {
                    onVictory(finalScore, victoryCarrots, level.gemsReward);
                  }, 3500);
                } else {
                  AudioSystem.playClick();
                }
                return updatedHp;
              });

              setExplosions((exps) => [
                ...exps,
                { id: `exp_${Date.now()}_${Math.random()}`, lane: laser.lane, distance: level.length, color: 'bg-cyan-400' }
              ]);
            }

            if (!hitRegistered) {
              updatedLasers.push({ ...laser, distance: nextLaserDist });
            }
          }
        });

        return updatedLasers;
      });

      // 2. Clear old explosions
      setExplosions((prevExps) => {
        // Just empty over time or let them trickle. For safety, let's keep list small and expire fast
        if (prevExps.length > 15) return prevExps.slice(prevExps.length - 15);
        return prevExps;
      });

      // 3. Boss Phase Attacks / Hazards
      if (isBossPhase && !isBossRescued) {
        // Automatic continuous Dog fire at Boss
        shootTimerRef.current += deltaTime;
        if (shootTimerRef.current >= 300) { // faster stream in boss battle!
          shootTimerRef.current = 0;
          AudioSystem.playShoot();
          setLasers((prev) => [
            ...prev,
            { id: `las_${Date.now()}_${Math.random()}`, lane: currentLane, distance: distanceCovered }
          ]);
        }

        // Boss launches core hazard blobs every 1.5 seconds
        bossAttackTimerRef.current += deltaTime;
        if (bossAttackTimerRef.current >= 1400) {
          bossAttackTimerRef.current = 0;
          const lanesList: ('left' | 'center' | 'right')[] = ['left', 'center', 'right'];
          const randomLane = lanesList[Math.floor(Math.random() * lanesList.length)];
          setHazards((prev) => [
            ...prev,
            { id: `hz_${Date.now()}_${Math.random()}`, lane: randomLane, distance: level.length }
          ]);
        }

        // Process hazard progression (boss hazards travel backwards towards the player)
        setHazards((prevHz) => {
          const speed = 0.05 * deltaTime;
          const updatedHz: ActiveBossHazard[] = [];

          prevHz.forEach((hz) => {
            const nextHzDist = hz.distance - speed;
            
            // Check if hazard reaches player depth
            if (nextHzDist <= distanceCovered) {
              if (hz.lane === currentLane) {
                // Slammed by hazard!
                setPlayerHp((hp) => {
                  const remaining = Math.max(0, hp - 20);
                  if (remaining <= 0) {
                    AudioSystem.playDefeat();
                  } else {
                    AudioSystem.playEnemyDefeat(); // damage plink
                  }
                  return remaining;
                });
                
                setFlashColor('rgba(239,68,68,0.5)');
                setTimeout(() => setFlashColor(null), 250);
                setTextIndicator({ text: "GLITCH HIT! -20 HP", color: "text-red-500 font-bold" });
                setTimeout(() => setTextIndicator(null), 1200);
              }
            } else {
              updatedHz.push({ ...hz, distance: nextHzDist });
            }
          });

          return updatedHz;
        });
      }

      requestRef.current = requestAnimationFrame(gameTick);
    };

    requestRef.current = requestAnimationFrame(gameTick);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [distanceCovered, currentLane, isBossPhase, currentPower, isBossRescued, score, playerHp]);

  // Transform coordinates along the 2.5D road perspective projection
  const getPerspectiveStyle = (itemDistance: number, lane: 'left' | 'center' | 'right') => {
    const relativeDistance = itemDistance - distanceCovered;
    
    // Do not show items behind us or too far ahead
    if (relativeDistance < -20 || relativeDistance > 500) {
      return { display: 'none' };
    }

    // Compute depth scroll percent: 0.0 (near horizon/far away) to 1.0 (right at player height)
    const rawPct = 1 - (relativeDistance / 500);
    const pct = Math.max(0, Math.min(1, rawPct));

    // Perspective depth size interpolation
    const scale = 0.08 + pct * 1.05;
    
    // Horizon coordinates top pos 20% to bottom pos 75%
    const top = 22 + (pct * pct) * 44; // curved to simulate rapid speed up

    // Lane divergence (Left tilts left, Right tilts right, Center tilts center)
    const laneIdx = getLaneIndex(lane);
    const laneSpread = laneIdx * pct * 34; // 34% width horizontal spacing at closest point
    const left = 50 + laneSpread;

    const opacity = pct < 0.1 ? pct * 10 : pct > 0.95 ? (1 - pct) * 20 : 1;

    return {
      position: 'absolute' as const,
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-50%, -50%) scale(${scale})`,
      opacity,
      zIndex: Math.round(100 - relativeDistance),
    };
  };

  return (
    <div className="absolute inset-0 bg-[#0a0a0a] overflow-hidden select-none font-sans text-white">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a3a4a] via-[#1b271b] to-[#0a0a0a]"></div>

      {/* Screen flash flash overlay */}
      {flashColor && (
        <div 
          className="absolute inset-0 z-50 pointer-events-none transition-all duration-100" 
          style={{ backgroundColor: flashColor }}
        ></div>
      )}

      {/* 2.5D Perspective Runway Container */}
      <div className="absolute inset-0 flex items-center justify-center pt-12">
        <div className="relative w-full h-full perspective-800">
          
          {/* THE RUNNING ROAD */}
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-[#1e1e1e] overflow-hidden"
            style={{ 
              clipPath: 'polygon(44% 0%, 56% 0%, 100% 100%, 0% 100%)',
              background: 'linear-gradient(0deg, #171717 0%, #292929 60%, #3a3a3a 100%)',
              borderTop: '4px solid #4ade80'
            }}
          >
            {/* Perspective moving lanes separator markings */}
            <div className={`absolute left-1/2 top-0 h-full w-2 -translate-x-1/2 opacity-25 ${isBossPhase ? 'scrolling-road-lines-paused' : 'scrolling-road-lines'}`}></div>
            <div className={`absolute left-[35%] top-0 h-full w-1 opacity-10 ${isBossPhase ? 'scrolling-road-lines-paused' : 'scrolling-road-lines'}`}></div>
            <div className={`absolute left-[65%] top-0 h-full w-1 opacity-10 ${isBossPhase ? 'scrolling-road-lines-paused' : 'scrolling-road-lines'}`}></div>
          </div>

          {/* DYNAMIC GAME ELEMENTS CAST IN PERSPECTIVE */}

          {/* 1. Spawning Math Gates */}
          {!isBossPhase && level.gates.map((gate) => {
            if (gatesCleared[gate.id]) return null;
            
            // Left gate container style
            const leftStyle = getPerspectiveStyle(gate.distance, 'left');
            // Right gate container style
            const rightStyle = getPerspectiveStyle(gate.distance, 'right');

            return (
              <React.Fragment key={gate.id}>
                {/* Addition / Multiplier (Green/Gold Options on Left) */}
                <div 
                  style={leftStyle} 
                  className={`w-36 h-48 border-4 rounded-2xl flex flex-col items-center justify-center backdrop-blur-xs shadow-lg font-display ${
                    gate.leftOp === 'add' || gate.leftOp === 'multiply' 
                      ? 'border-[#4ade80] bg-[#4ade80]/15 shadow-[#4ade80]/20' 
                      : 'border-red-500 bg-red-500/15 shadow-red-500/20'
                  }`}
                >
                  <div className={`text-4xl font-black drop-shadow-md ${gate.leftOp === 'add' || gate.leftOp === 'multiply' ? 'text-[#4ade80]' : 'text-red-500'}`}>
                    {gate.leftOp === 'add' ? `+${gate.leftVal}` : gate.leftOp === 'subtract' ? `-${gate.leftVal}` : gate.leftOp === 'multiply' ? `x${gate.leftVal}` : `÷${gate.leftVal}`}
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mt-1.5 font-mono">
                    {gate.leftOp === 'multiply' || gate.leftOp === 'add' ? 'POWER UP' : 'POWER LOSS'}
                  </div>
                </div>

                {/* Counter Option on Right side */}
                <div 
                  style={rightStyle} 
                  className={`w-36 h-48 border-4 rounded-2xl flex flex-col items-center justify-center backdrop-blur-xs shadow-lg font-display ${
                    gate.rightOp === 'add' || gate.rightOp === 'multiply' 
                      ? 'border-[#4ade80] bg-[#4ade80]/15 shadow-[#4ade80]/20' 
                      : 'border-red-500 bg-red-500/15 shadow-red-500/20'
                  }`}
                >
                  <div className={`text-4xl font-black drop-shadow-md ${gate.rightOp === 'add' || gate.rightOp === 'multiply' ? 'text-[#4ade80]' : 'text-red-500'}`}>
                    {gate.rightOp === 'add' ? `+${gate.rightVal}` : gate.rightOp === 'subtract' ? `-${gate.rightVal}` : gate.rightOp === 'multiply' ? `x${gate.rightVal}` : `÷${gate.rightVal}`}
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mt-1.5 font-mono">
                    {gate.rightOp === 'multiply' || gate.rightOp === 'add' ? 'POWER UP' : 'POWER LOSS'}
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* 2. Spawning Mechanical Rogue Squirrels */}
          {!isBossPhase && enemies.map((enemy) => {
            if (enemy.hp <= 0) return null;
            const style = getPerspectiveStyle(enemy.distance, enemy.lane);

            return (
              <div key={enemy.id} style={style} className="flex flex-col items-center select-none">
                {/* Robot Squirrel Art */}
                <div className="w-14 h-14 bg-zinc-700 rounded-full border-4 border-zinc-400 relative shadow-2xl animate-bounce flex items-center justify-center">
                  {/* Glowing Eye */}
                  <div className="absolute top-3 left-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="absolute top-3 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  {/* Metal Ears */}
                  <div className="absolute -top-1.5 -left-1 w-4 h-4 bg-zinc-500 rounded-tr-lg border-2 border-zinc-400"></div>
                  <div className="absolute -top-1.5 -right-1 w-4 h-4 bg-zinc-500 rounded-tl-lg border-2 border-zinc-400"></div>
                  {/* Iron tail */}
                  <div className="absolute -bottom-1 -right-3 w-6 h-6 bg-zinc-600 rounded-full border-2 border-zinc-400"></div>
                  <span className="text-xl relative top-0.5">🐿️</span>
                </div>
                {/* HP floating badge */}
                <span className="mt-1.5 bg-black/85 border border-red-500/40 text-red-400 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold tabular-nums">
                  HP {enemy.hp}
                </span>
              </div>
            );
          })}

          {/* 3. Laser projectles flying up the perspective road */}
          {lasers.map((laser) => {
            const style = getPerspectiveStyle(laser.distance, laser.lane);
            return (
              <div 
                key={laser.id} 
                style={style} 
                className="w-4 h-16 bg-gradient-to-b from-amber-300 via-[#4ade80] to-cyan-500 rounded-full shadow-[0_0_15px_#4ade80] animate-pulse"
              />
            );
          })}

          {/* 4. Active explosions particles */}
          {explosions.map((exp) => {
            const style = getPerspectiveStyle(exp.distance, exp.lane);
            return (
              <div 
                key={exp.id} 
                style={style} 
                className="flex items-center justify-center"
              >
                <div className={`w-14 h-14 rounded-full ${exp.color} opacity-90 blur-xs scale-150 animate-ping`} />
              </div>
            );
          })}

          {/* 5. Active Boss Glitch hazards blobs */}
          {hazards.map((hz) => {
            const style = getPerspectiveStyle(hz.distance, hz.lane);
            return (
              <div 
                key={hz.id} 
                style={style} 
                className="w-10 h-10 bg-red-600 border-2 border-red-400 rounded-full shadow-[0_0_20px_rgba(239, 68, 68, 0.8)] relative flex items-center justify-center animate-spin"
              >
                <span className="text-xs font-mono font-black text-white">✖</span>
              </div>
            );
          })}

          {/* 6. GIANT MINI-BOSS ARENA CAST AT THE END OF THE VECTOR */}
          {isBossPhase && (
            <div 
              style={{
                position: 'absolute',
                top: '22%', // anchor to horizon
                left: '50%',
                transform: 'translate(-50%, -40%) scale(1.3)',
                zIndex: 4,
              }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                {/* Radiant status ring */}
                <div className={`absolute -inset-8 rounded-full blur-xl opacity-60 transition-colors duration-500 ${isBossRescued ? 'bg-green-500 animate-pulse' : 'bg-red-500/30'}`} />

                {/* Large 3D representation representing corrupted mini-boss */}
                <div className={`text-7xl p-6 rounded-full border-4 shadow-2xl relative transition-all duration-500 ${
                  isBossRescued 
                    ? 'bg-[#4ade80]/20 border-[#4ade80] scale-110' 
                    : 'bg-red-500/10 border-red-500 animate-bounce'
                }`}>
                  {/* Rescued Halo */}
                  {isBossRescued && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-black text-[10px] font-black rounded-full shadow-[0_0_15px_#4ade80] uppercase tracking-wider font-mono">
                      RESCUED!
                    </div>
                  )}
                  {level.boss.buddyIcon}
                </div>
              </div>

              {/* Boss Stat Bars */}
              <div className="mt-4 bg-black/80 border border-white/10 px-4 py-2 rounded-2xl w-56 text-center select-none shadow-xxl backdrop-blur-md">
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                  {isBossRescued ? 'Alliance Unlocked Character' : 'Node Corrupted Boss'}
                </div>
                <div className="text-xs font-black text-white">{level.boss.name}</div>
                
                {/* Health Bar */}
                <div className="w-full h-2.5 bg-zinc-900 border border-white/5 rounded-full overflow-hidden mt-2 relative">
                  <div 
                    className={`h-full transition-all duration-100 ${isBossRescued ? 'bg-[#4ade80] w-full' : 'bg-red-600'}`}
                    style={{ width: isBossRescued ? '100%' : `${(bossHp / level.boss.maxHp) * 100}%` }}
                  />
                </div>
                <div className="text-[8px] font-mono text-zinc-400 font-bold mt-1 tabular-nums">
                  {isBossRescued ? 'HP CURED 100%' : `HP ${bossHp} / ${level.boss.maxHp}`}
                </div>
              </div>
            </div>
          )}

          {/* HERO CHARCTER: Friendly Dog Hero (Centered & aligned) */}
          <div 
            className="absolute bottom-[8%] left-1/2 flex flex-col items-center transition-all duration-200"
            style={{
              left: currentLane === 'left' ? '18%' : currentLane === 'right' ? '82%' : '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
            }}
          >
            {/* POWER FLUSH RATING ON STAR */}
            <div className="mb-2.5 px-4.5 py-1.5 bg-[#4ade80] text-black font-black text-xs rounded-full shadow-[0_0_15px_#4ade80] flex items-center gap-1.5 font-mono">
              <Swords className="w-3.5 h-3.5" /> POWER: {currentPower}
            </div>

            {/* CUTE DOG HERO SHAPE */}
            <div className="relative">
              <div className="w-20 h-28 bg-amber-500 rounded-[35px] border-4 border-amber-300 shadow-2xl relative flex items-center justify-center">
                {/* Ears */}
                <div className="absolute -top-3 -left-1.5 w-6 h-10 bg-amber-600 rounded-full rotate-[-20deg]"></div>
                <div className="absolute -top-3 -right-1.5 w-6 h-10 bg-amber-600 rounded-full rotate-[20deg]"></div>
                {/* Eyes */}
                <div className="absolute top-5 left-4 w-2.5 h-2.5 bg-black rounded-full"></div>
                <div className="absolute top-5 right-4 w-2.5 h-2.5 bg-black rounded-full"></div>
                {/* Cute smile / nose */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-2.5 h-2 bg-black rounded-full"></div>
                  <div className="w-3.5 h-1.5 border-b-2 border-black rounded-b-md"></div>
                </div>
                {/* Cape */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-10 bg-red-600 rounded-lg -z-10 opacity-90"></div>
                
                <span className="text-2xl relative top-5.5">🐶</span>
              </div>
              {/* Ground shadow flare */}
              <div className="absolute -bottom-2 w-full h-2.5 bg-black/40 blur-xs rounded-full"></div>
            </div>
          </div>

        </div>
      </div>

      {/* FLOAT ALERTS AND TEXT INSTRUCTIONS OVERLAYS */}
      {textIndicator && (
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 z-30 bg-black/90 border border-white/10 px-6 py-3 rounded-2xl shadow-2xl text-center select-none font-bold text-sm tracking-wider flex items-center gap-2">
          <span className={textIndicator.color}>{textIndicator.text}</span>
        </div>
      )}

      {/* HUD OVERLAYS STATUS PANEL (NON POINTER EVENTS) */}
      <div className="absolute inset-0 pointer-events-none">
        
        {/* Top HUD Row */}
        <div className="p-8 flex justify-between items-start">
          <div className="flex gap-4">
            {/* Health Shield widget */}
            <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-xl border-2 border-amber-300 flex items-center justify-center text-md font-bold">D</div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Dog Shield Health</div>
                <div className="w-40 h-2.5 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-150"
                    style={{ width: `${(playerHp / maxHealth) * 100}%` }}
                  ></div>
                </div>
                <div className="text-[8px] font-mono text-zinc-500 tabular-nums font-bold">
                  {playerHp} / {maxHealth} HP
                </div>
              </div>
            </div>

            {/* Score & Currencies HUD */}
            <div className="flex flex-col gap-2">
              <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-4.5">
                <div className="flex items-center gap-1">
                  <span className="text-zinc-500 text-[10px] font-mono uppercase font-bold">Score:</span>
                  <span className="text-sm font-black tabular-nums">{score}</span>
                </div>
                <div className="h-4 w-px bg-white/10"></div>
                <div className="flex items-center gap-1">
                  <span className="text-orange-400 text-sm">🥕</span>
                  <span className="text-sm font-black tabular-nums text-amber-400">{carrotsCollected}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress details */}
          <div className="text-right">
            <div className="text-[10px] font-bold text-[#4ade80] uppercase tracking-widest font-mono">
              {level.name}
            </div>
            
            {/* Progress Bar meters */}
            {!isBossPhase ? (
              <div className="mt-2 text-right">
                <div className="w-48 h-2 bg-zinc-800 border border-white/5 rounded-full overflow-hidden inline-block relative">
                  <div 
                    className="h-full bg-gradient-to-r from-[#4ade80] to-cyan-400 transition-all"
                    style={{ width: `${(distanceCovered / level.length) * 100}%` }}
                  />
                </div>
                <div className="text-[8px] font-mono text-zinc-500 font-bold block">
                  {Math.round(distanceCovered)}m / {level.length}m RUN
                </div>
              </div>
            ) : (
              <span className="inline-block mt-2 bg-red-600/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase px-2.5 py-1 rounded-md animate-pulse">
                BOSS STAGED
              </span>
            )}
          </div>
        </div>

        {/* Floating Side Watermarks */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 rotate-[-90deg] origin-left opacity-20 text-[10px] tracking-[0.4em] uppercase font-mono">
          Furry_Force_Engine_v0.1.0_MVP
        </div>
        <div className="absolute right-4 top-1/2 translate-y-1/2 rotate-[90deg] origin-right opacity-20 text-[10px] tracking-[0.4em] uppercase font-mono">
          Render_Mode_2.5D_Perspective
        </div>
      </div>

      {/* Bottom controls panel (interactive overlay triggers) */}
      <div className="absolute bottom-10 inset-x-0 z-30">
        <div className="max-w-md mx-auto px-6 flex justify-between items-center gap-4">
          
          {/* MUTE SYSTEM CONTROL and QUIT BUTTON (Left Area) */}
          <div className="flex gap-2">
            <button
              onClick={onQuit}
              className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-2xl text-zinc-400 hover:text-white text-xxs font-black uppercase cursor-pointer"
            >
              QUIT
            </button>
            <button
              onClick={handleToggleMute}
              className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-2xl text-zinc-400 hover:text-white cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-[#4ade80]" />}
            </button>
          </div>

          {/* LANE MOVEMENT HINT (Center Area) */}
          <div className="flex-1 bg-black/60 border border-white/10 rounded-2xl py-2 px-4 shadow-lg text-center flex items-center justify-between pointer-events-none md:flex">
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 border border-white/20 rounded flex items-center justify-center text-white/50 text-xxs">A</div>
              <span className="text-[7px] text-zinc-500 uppercase font-bold mt-0.5">Left</span>
            </div>
            
            <p className="text-[10px] font-semibold text-white/60 italic px-2">
              {isBossPhase ? 'Dodge boss hazards!' : 'Steer through positive gates!'}
            </p>

            <div className="flex flex-col items-center">
              <div className="w-7 h-7 border border-white/20 rounded flex items-center justify-center text-white/50 text-xxs">D</div>
              <span className="text-[7px] text-zinc-500 uppercase font-bold mt-0.5">Right</span>
            </div>
          </div>

          {/* TOUCH MOVEMENT HELPER OVERLAYS */}
          {/* We lay out transparent active block overlays in the background of the screen. Tap left to steer Left, tap right to steer Right. */}
        </div>
      </div>

      {/* Big invisible touch zones for mobile steer comfort */}
      <div 
        onClick={() => handleSideClick('left')} 
        className="absolute top-1/4 bottom-[20%] left-0 w-1/4 z-10 cursor-pointer"
      />
      <div 
        onClick={() => handleSideClick('right')} 
        className="absolute top-1/4 bottom-[20%] right-0 w-1/4 z-10 cursor-pointer"
      />
    </div>
  );
}
