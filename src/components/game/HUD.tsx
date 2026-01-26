import React, { useEffect, useRef } from 'react';
import { Sword, Zap, Plus } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useConfigStore } from '../../store/configStore';
import { useInventoryStore } from '../../store/inventoryStore';
import { GameEngine } from '../../game/core/GameEngine';

export const HUD: React.FC = () => {
  const { hp, maxHp, exp, maxExp, level, wave } = useGameStore();
  const { bulletDamage, playerSpeed, damageMultiplier, speedMultiplier, damagePerLevel, speedPerLevel } = useConfigStore();
  const { weapons } = useInventoryStore();
  
  // Calculate displayed stats (Base * Multiplier)
  // Multiplier = BaseMult + (Level * LevelScale)
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
              // Circle circumference = 2 * PI * r
              // r = 18 (viewBox 0 0 40 40, center 20 20, r=18 to fit stroke)
              // C ≈ 113.1
              const circumference = 113.1;
              const offset = circumference - (progress * circumference);
              circleRef.current.style.strokeDashoffset = offset.toString();
          }
          rafId = requestAnimationFrame(updateWaveProgress);
      };
      rafId = requestAnimationFrame(updateWaveProgress);
      return () => cancelAnimationFrame(rafId);
  }, []);
  
  // Access game instance to get weapon details/levels
  const game = GameEngine.getInstance();
  const weaponManager = game.getWeaponManager ? game.getWeaponManager() : null;

  const hpPercent = Math.max(0, (hp / maxHp) * 100);
  const expPercent = Math.min(100, (exp / maxExp) * 100);

  // Slots (4 max)
  const weaponSlots = [0, 1, 2, 3];

  return (
    <div className="absolute inset-x-0 top-0 p-4 pt-safe pointer-events-none flex flex-col gap-3 h-full pb-safe">
      
      {/* Top Status Bar: Level + Bars + Wave */}
      <div className="flex items-center gap-3 w-full">
        {/* Level Badge */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-black/40 w-12 h-12 rounded-lg border border-white/20 backdrop-blur-md shadow-lg">
            <span className="text-[10px] text-white/60 uppercase font-bold">Lv</span>
            <span className="text-xl font-bold leading-none text-yellow-400">{level}</span>
        </div>

        {/* Bars Container (Center) */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            {/* HP Bar */}
            <div className="w-full h-5 bg-black/60 rounded-full overflow-hidden border border-white/20 relative backdrop-blur-sm">
                <div 
                    className="h-full bg-red-500 transition-all duration-300" 
                    style={{ width: `${hpPercent}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                    {Math.ceil(hp)} / {maxHp}
                </div>
            </div>
            
            {/* EXP Bar */}
            <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/10 relative backdrop-blur-sm">
                 <div 
                    className="h-full bg-blue-500 transition-all duration-300" 
                    style={{ width: `${expPercent}%` }}
                />
            </div>
             {/* Centered EXP Text */}
             <div className="text-center text-[10px] text-white/50 font-mono -mt-1">
                {Math.floor(exp)} / {maxExp} XP
             </div>
        </div>

        {/* Wave Badge (Timer) */}
        <div className="flex-shrink-0 relative w-12 h-12 bg-black/40 rounded-lg backdrop-blur-md shadow-lg border border-white/20 flex flex-col items-center justify-center overflow-hidden">
             {/* SVG Timer Ring */}
             <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 40 40">
                {/* Background Ring */}
                <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                {/* Progress Ring */}
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

             <span className="text-[8px] text-white/60 uppercase font-bold z-10">Wave</span>
             <span className="text-xl font-bold leading-none text-red-400 z-10">{wave}</span>
        </div>
      </div>

      {/* Stats & Weapons Row */}
      <div className="flex justify-between items-start">
        {/* Stats */}
        <div className="flex gap-2">
            <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/5 text-xs font-bold text-white/90">
                <Sword size={12} className="text-red-400" />
                <span>{displayedDamage}</span>
            </div>
            <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/5 text-xs font-bold text-white/90">
                <Zap size={12} className="text-yellow-400" />
                <span>{displayedSpeed}</span>
            </div>
        </div>

        {/* Weapon Slots */}
        <div className="flex gap-1.5">
            {weaponSlots.map(index => {
                const weaponId = weapons[index];
                const weapon = weaponId && weaponManager ? weaponManager.getWeapon(weaponId) : null;
                
                return (
                    <div key={index} className="w-8 h-8 bg-black/40 border border-white/20 rounded-md flex items-center justify-center relative backdrop-blur-sm">
                        {weapon ? (
                            <>
                               {weapon.icon && <weapon.icon size={16} className="text-white" />}
                               <div className="absolute -bottom-1 -right-1 bg-black/80 text-[8px] px-1 rounded border border-white/10 text-white font-bold scale-90">
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
      </div>

      {/* Bottom Area is now clear for controls */}
    </div>
  );
};
