import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { useConfigStore } from '../../store/configStore';
import { GameEngine } from '../../game/core/GameEngine';
import { useInventoryStore } from '../../store/inventoryStore';
import { MagicWand } from '../../game/weapons/MagicWand';
import { OrbitShield } from '../../game/weapons/OrbitShield';
import { Axe } from '../../game/weapons/Axe';
// import { Weapon } from '../../game/weapons/Weapon';

// Weapon Definitions for the pool
const WEAPON_POOL = [
  { id: 'magic_wand', class: MagicWand },
  { id: 'orbit_shield', class: OrbitShield },
  { id: 'axe', class: Axe },
];

export const LevelUpModal: React.FC = () => {
  const { isLevelUp, setLevelUp } = useGameStore();
  const config = useConfigStore();
  const inventory = useInventoryStore();
  const [options, setOptions] = useState<any[]>([]);

  useEffect(() => {
    if (isLevelUp) {
      generateOptions();
    }
  }, [isLevelUp]);

  const generateOptions = () => {
    const game = GameEngine.getInstance();
    const manager = game.getWeaponManager();
    const choices: any[] = [];

    // 1. Existing Weapons (Upgrade)
    manager.weapons.forEach(w => {
        if (w.level < w.maxLevel) {
            choices.push({
                type: 'upgrade',
                id: w.id,
                name: w.name,
                desc: `Upgrade to Lv.${w.level + 1}`,
                icon: w.icon,
                weapon: w
            });
        }
    });

    // 2. New Weapons (New)
    if (!manager.isFull()) {
        WEAPON_POOL.forEach(def => {
            if (!manager.hasWeapon(def.id)) {
                // Instantiate temp to get metadata
                // Optimization: Store metadata statically
                const temp = new def.class(game); 
                choices.push({
                    type: 'new',
                    id: def.id,
                    name: temp.name,
                    desc: temp.description,
                    icon: temp.icon,
                    class: def.class
                });
            }
        });
    }

    // 3. Heal (Fallback)
    const healOption = {
        type: 'heal',
        id: 'heal',
        name: 'Chicken Leg',
        desc: 'Heal 30 HP',
        icon: Heart,
        color: 'text-green-400'
    };

    // Shuffle and pick 3
    // If no weapons available, just show heal + gold (todo)
    let available = [...choices];
    const selected = [];
    
    // Always try to give at least one weapon option if possible
    for (let i = 0; i < 3; i++) {
        if (available.length > 0) {
            const idx = Math.floor(Math.random() * available.length);
            selected.push(available[idx]);
            available.splice(idx, 1);
        } else {
            selected.push(healOption);
        }
    }

    setOptions(selected);
  };

  const handleSelect = (option: any) => {
    const game = GameEngine.getInstance();
    
    if (option.type === 'upgrade') {
        game.getWeaponManager().upgradeWeapon(option.id);
    } else if (option.type === 'new') {
        const newWeapon = new option.class(game);
        game.getWeaponManager().addWeapon(newWeapon);
        inventory.addWeapon(option.id);
    } else if (option.type === 'heal') {
        config.updateConfig('playerHealth', config.playerHealth); // No max hp increase, just heal
        const currentHp = useGameStore.getState().hp;
        useGameStore.getState().setStats({ hp: Math.min(config.playerHealth, currentHp + 30) });
    }

    setLevelUp(false);
  };

  if (!isLevelUp) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
      >
        <div className="w-full max-w-lg space-y-6">
          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-bold text-center text-white drop-shadow-glow"
          >
            Level Up!
          </motion.h2>

          <div className="grid gap-4">
            {options.map((option, index) => (
              <GlassCard
                key={`${option.id}-${index}`}
                className="p-4 cursor-pointer hover:bg-white/10 transition-colors flex items-center gap-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(option)}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1, transition: { delay: index * 0.1 } }}
              >
                <div className={`p-3 rounded-xl bg-white/10 ${option.color || 'text-blue-400'}`}>
                  {option.icon ? <option.icon size={24} /> : <Plus size={24} />}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold">{option.name}</h3>
                        {option.type === 'new' && <span className="text-xs bg-yellow-500 text-black px-2 rounded-full font-bold">NEW</span>}
                        {option.type === 'upgrade' && <span className="text-xs bg-blue-500 text-white px-2 rounded-full font-bold">UPGRADE</span>}
                    </div>
                  <p className="text-sm text-white/60">{option.desc}</p>
                </div>
                <Button variant="secondary" size="sm">Select</Button>
              </GlassCard>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
