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
  const game = GameEngine.getInstance(); // This might be risky if React renders before Game init, but usually safe after mount
  const weaponManager = game.getWeaponManager ? game.getWeaponManager() : null;

  const hpPercent = Math.max(0, (hp / maxHp) * 100);
  const expPercent = Math.min(100, (exp / maxExp) * 100);

  // Slots (4 max)
  const weaponSlots = [0, 1, 2, 3];

  return (
    <div className="absolute inset-x-0 top-0 p-4 pt-safe pointer-events-none flex flex-col gap-2 h-full pb-safe">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="text-xl font-bold">Wave {wave}</div>
          <div className="text-sm text-white/50">Level {level}</div>
        </div>
        
        {/* HP Bar */}
        <div className="w-48 bg-black/40 h-4 rounded-full overflow-hidden border border-white/10 relative">
            <div 
                className="h-full bg-red-500 transition-all duration-300" 
                style={{ width: `${hpPercent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                {Math.ceil(hp)} / {maxHp}
            </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-4 text-xs font-bold text-white/80">
        <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/5">
          <Sword size={12} className="text-red-400" />
          <span>{bulletDamage}</span>
        </div>
        <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/5">
          <Zap size={12} className="text-yellow-400" />
          <span>{playerSpeed.toFixed(1)}</span>
        </div>
      </div>

      {/* Weapon Slots (Top Right or Center, let's put under stats for now) */}
      <div className="flex gap-2 mt-2">
        {weaponSlots.map(index => {
            const weaponId = weapons[index];
            const weapon = weaponId && weaponManager ? weaponManager.getWeapon(weaponId) : null;
            
            return (
                <div key={index} className="w-10 h-10 bg-black/40 border border-white/20 rounded-lg flex items-center justify-center relative">
                    {weapon ? (
                        <>
                           {weapon.icon && <weapon.icon size={20} className="text-white" />}
                           <div className="absolute bottom-0 right-0 bg-black/60 text-[8px] px-1 rounded-tl">
                               Lv.{weapon.level}
                           </div>
                        </>
                    ) : (
                        <div className="text-white/10"><Plus size={16} /></div>
                    )}
                </div>
            );
        })}
      </div>

      {/* Bottom Bar: EXP */}
      <div className="mt-auto w-full">
        <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/10">
            <div 
                className="h-full bg-blue-500 transition-all duration-300" 
                style={{ width: `${expPercent}%` }}
            />
        </div>
        <div className="text-center text-xs text-white/40 mt-1">
            {Math.floor(exp)} / {maxExp} XP
        </div>
      </div>
    </div>
  );
};
