import React, { useEffect, useRef, useState } from 'react';
import { Sword, Zap, Plus, Trophy, Home } from 'lucide-react';
import { useGameStore } from '../../../store/gameStore';
import { useConfigStore } from '../../../store/configStore';
import { useInventoryStore } from '../../../store/inventoryStore';
import { GameEngine } from '../../../game/core/GameEngine';
import { Button } from '../../ui/Button';
import { formatScore } from '../../../game/utils/formatUtils';

export const HUD_V2: React.FC = () => {
  const { hp, maxHp, exp, maxExp, level, wave, score, isPaused, togglePause } = useGameStore();
  const { bulletDamage, playerSpeed, damageMultiplier, speedMultiplier, damagePerLevel, speedPerLevel } = useConfigStore();
  const { weapons } = useInventoryStore();
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // Calculate displayed stats
  const currentDamageMult = damageMultiplier + ((level - 1) * damagePerLevel);
  const currentSpeedMult = speedMultiplier + ((level - 1) * speedPerLevel);
  
  const displayedDamage = Math.round(bulletDamage * currentDamageMult);
  const displayedSpeed = (playerSpeed * currentSpeedMult).toFixed(1);

  // Wave Timer Logic
  const circleRef = useRef<SVGCircleElement>(null);
  
  useEffect(() => {
      let rafId: number;
      const updateWaveProgress = () => {
          const game = GameEngine.getInstance();
          if (game && circleRef.current) {
              const progress = game.getWaveProgress ? game.getWaveProgress() : 0;
              const circumference = 113.1;
              const offset = circumference - (progress * circumference);
              circleRef.current.style.strokeDashoffset = offset.toString();
          }
          rafId = requestAnimationFrame(updateWaveProgress);
      };
      rafId = requestAnimationFrame(updateWaveProgress);
      return () => cancelAnimationFrame(rafId);
  }, []);
  
  const game = GameEngine.getInstance();
  const weaponManager = game.getWeaponManager ? game.getWeaponManager() : null;

  const hpPercent = Math.max(0, (hp / maxHp) * 100);
  const expPercent = Math.min(100, (exp / maxExp) * 100);

  const weaponSlots = [0, 1, 2, 3];

  const handleExitClick = () => {
    if (!isPaused) {
        togglePause(true);
    }
    setShowExitConfirm(true);
  };

  const handleConfirmExit = () => {
    window.location.reload();
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
    togglePause(false);
  };

  return (
    <div className="absolute inset-x-0 top-0 p-4 pt-safe pointer-events-none flex flex-col h-full pb-safe z-10">
      
      {/* === TOP BAR (Row 1) === */}
      <div className="flex items-center justify-between w-full gap-4">
        
        {/* LEFT: Level Only */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-black/40 w-10 h-10 rounded-lg border border-white/20 backdrop-blur-md shadow-lg">
            <span className="text-[6px] text-white/60 uppercase font-bold">Lv</span>
            <span className="text-base font-bold leading-none text-yellow-400">{level}</span>
        </div>

        {/* CENTER: HP/EXP (Expanded) */}
        <div className="flex-1 max-w-md flex flex-col items-center gap-1">
            {/* HP Bar */}
            <div className="w-full h-4 bg-black/60 rounded-full overflow-hidden border border-white/20 relative backdrop-blur-sm shadow-md">
                <div 
                    className="h-full bg-red-500 transition-all duration-300" 
                    style={{ width: `${hpPercent}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white drop-shadow-md">
                    {Math.ceil(hp)} / {maxHp}
                </div>
            </div>
            
            {/* EXP Bar */}
            <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10 relative backdrop-blur-sm">
                 <div 
                    className="h-full bg-blue-500 transition-all duration-300" 
                    style={{ width: `${expPercent}%` }}
                />
                 <div className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-white/90 drop-shadow-md">
                    {Math.floor(exp)} / {maxExp} XP
                </div>
            </div>
        </div>

        {/* RIGHT: Wave Only */}
        <div className="flex-shrink-0 relative w-10 h-10 bg-black/40 rounded-lg backdrop-blur-md shadow-lg border border-white/20 flex flex-col items-center justify-center overflow-hidden">
             <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <circle 
                    ref={circleRef}
                    cx="20" cy="20" r="18" 
                    fill="none" 
                    stroke="#ef4444" 
                    strokeWidth="3"
                    strokeDasharray="113.1"
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    className="transition-[stroke-dashoffset] duration-200 linear"
                />
             </svg>
             <span className="text-[5px] text-white/60 uppercase font-bold z-10">Wave</span>
             <span className="text-base font-bold leading-none text-red-400 z-10">{wave}</span>
        </div>
      </div>

      {/* === SECONDARY ROW (Row 2) === */}
      {/* Container for alignment */}
      <div className="relative w-full h-12 mt-2 pointer-events-none px-4">
          
          {/* LEFT: Stats (Compact Vertical Stack) */}
          <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-between w-14 gap-1.5">
            <div className="flex items-center justify-center gap-1 bg-black/30 rounded-lg backdrop-blur-sm border border-white/5 h-full w-full">
                <Sword size={10} className="text-red-400 flex-shrink-0" />
                <span className="text-[9px] font-bold text-white/90 truncate">{displayedDamage}</span>
            </div>
            <div className="flex items-center justify-center gap-1 bg-black/30 rounded-lg backdrop-blur-sm border border-white/5 h-full w-full">
                <Zap size={10} className="text-yellow-400 flex-shrink-0" />
                <span className="text-[9px] font-bold text-white/90 truncate">{displayedSpeed}</span>
            </div>
          </div>

          {/* CENTER: Weapons (Absolute Center) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 flex gap-1 pointer-events-auto h-full items-center z-20">
            {weaponSlots.map(index => {
                const weaponId = weapons[index];
                const weapon = weaponId && weaponManager ? weaponManager.getWeapon(weaponId) : null;
                
                return (
                    <div key={index} className="w-8 h-8 bg-black/40 border border-white/20 rounded-md flex items-center justify-center relative backdrop-blur-sm shadow-sm">
                        {weapon ? (
                            <>
                               {weapon.icon && <weapon.icon size={16} className="text-white" />}
                               <div className="absolute -bottom-1 -right-1 bg-black/80 text-[6px] px-1 rounded border border-white/10 text-white font-bold scale-90">
                                   {weapon.level}
                               </div>
                            </>
                        ) : (
                            <div className="text-white/10"><Plus size={12} /></div>
                        )}
                    </div>
                );
            })}
          </div>

          {/* RIGHT: Score & Home (Compact Vertical Stack) - Symmetrical to Left */}
          <div className="absolute right-4 top-0 bottom-0 flex flex-col justify-between w-14 gap-1.5 items-end pointer-events-auto">
             {/* Score */}
             <div className="bg-black/60 rounded-lg border border-white/10 flex items-center justify-center gap-1 backdrop-blur-md h-full w-full">
                <Trophy size={10} className="text-yellow-400 flex-shrink-0" />
                <span className="text-[9px] font-bold text-white font-mono truncate">{formatScore(score)}</span>
            </div>

            {/* Home Button */}
            <button 
                onClick={handleExitClick}
                className="bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-md flex items-center justify-center text-white/80 hover:bg-red-500/40 active:scale-95 transition-all h-full w-full"
                aria-label="Exit to Menu"
            >
                <Home size={12} />
            </button>
          </div>

      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-xs space-y-4 shadow-2xl">
                <h3 className="text-xl font-bold text-white text-center">Quit to Menu?</h3>
                <p className="text-sm text-gray-400 text-center">
                    Current progress for this run will be lost.
                </p>
                <div className="flex gap-3">
                    <Button variant="ghost" className="flex-1" onClick={handleCancelExit}>Cancel</Button>
                    <Button variant="danger" className="flex-1" onClick={handleConfirmExit}>Quit</Button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};
