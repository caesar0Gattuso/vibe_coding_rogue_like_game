import React from 'react';
import { Sword, Zap, Plus } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useConfigStore } from '../../store/configStore';
import { useInventoryStore } from '../../store/inventoryStore';
import { GameEngine } from '../../game/core/GameEngine';

export const HUD: React.FC = () => {
  const { hp, maxHp, exp, maxExp, level, wave } = useGameStore();
  const { bulletDamage, playerSpeed } = useConfigStore();
  const { weapons } = useInventoryStore();
  
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
        </div>

        {/* Wave Info (Right) */}
        <div className="flex-shrink-0 flex flex-col items-end pl-1">
             <div className="text-lg font-bold text-white drop-shadow-md">Wave {wave}</div>
             <div className="text-[10px] text-white/50 font-mono">{Math.floor(exp)} XP</div>
        </div>
      </div>

      {/* Stats & Weapons Row */}
      <div className="flex justify-between items-start">
        {/* Stats */}
        <div className="flex gap-2">
            <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/5 text-xs font-bold text-white/90">
                <Sword size={12} className="text-red-400" />
                <span>{bulletDamage}</span>
            </div>
            <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/5 text-xs font-bold text-white/90">
                <Zap size={12} className="text-yellow-400" />
                <span>{playerSpeed.toFixed(1)}</span>
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
