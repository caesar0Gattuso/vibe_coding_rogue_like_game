import React, { useEffect, useState } from 'react';
import { useConfigStore } from '../../store/configStore';
import { GameEngine } from '../../game/core/GameEngine';
import { Hand, Sword, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TutorialOverlay: React.FC = () => {
  const { tutorial } = useConfigStore();
  const [gemPos, setGemPos] = useState<{x: number, y: number} | null>(null);
  const [playerPos, setPlayerPos] = useState<{x: number, y: number} | null>(null);
  
  // Polling for positions
  useEffect(() => {
    if (tutorial.hasCollectedGem && tutorial.hasAttacked && tutorial.hasMoved) return;

    const interval = setInterval(() => {
      const game = GameEngine.getInstance();
      if (!game) return; // Might be null during init
      
      const player = game.getPlayer ? game.getPlayer() : null;
      if (!player) return;

      setPlayerPos({ x: player.x, y: player.y });

      // Gem Logic
      if (!tutorial.hasCollectedGem && tutorial.hasAttacked) {
        const gems = game.getExpGems ? game.getExpGems() : [];
        if (gems.length > 0) {
          // Find nearest
          let nearest = gems[0];
          let minDist = Infinity;
          gems.forEach(g => {
             const dist = Math.hypot(g.x - player.x, g.y - player.y);
             if (dist < minDist) {
                 minDist = dist;
                 nearest = g;
             }
          });
          setGemPos({ x: nearest.x, y: nearest.y });
        } else {
            setGemPos(null);
        }
      }
    }, 100); // 10fps update for UI is enough

    return () => clearInterval(interval);
  }, [tutorial]);

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {/* Stage 1: Move */}
        {!tutorial.hasMoved && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
             <div className="flex flex-col items-center gap-4">
                <motion.div
                   animate={{ x: [0, -30, 0, 30, 0], y: [0, 20, 0, -20, 0] }}
                   transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                   className="bg-white/10 p-4 rounded-full backdrop-blur-sm border border-white/20"
                >
                    <Hand size={48} className="text-white drop-shadow-lg" />
                </motion.div>
                <div className="text-white text-xl font-bold drop-shadow-lg bg-black/40 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10">
                    Drag to Move
                </div>
             </div>
          </motion.div>
        )}

        {/* Stage 2: Attack */}
        {tutorial.hasMoved && !tutorial.hasAttacked && playerPos && (
             <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute"
                style={{ left: playerPos.x, top: playerPos.y - 80 }}
             >
                 <div className="flex flex-col items-center gap-2 w-48 text-center -translate-x-1/2">
                    <div className="text-white/90 text-sm font-bold bg-red-500/80 px-3 py-1 rounded-full backdrop-blur-sm shadow-lg border border-red-400/50 whitespace-nowrap">
                        Approach Enemies to Attack
                    </div>
                    <Sword size={24} className="text-red-400 animate-bounce drop-shadow-lg" />
                 </div>
             </motion.div>
        )}

        {/* Stage 3: Collect */}
        {tutorial.hasMoved && tutorial.hasAttacked && !tutorial.hasCollectedGem && gemPos && (
             <motion.div
                initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="absolute"
                style={{ left: gemPos.x, top: gemPos.y - 40 }}
             >
                <div className="flex flex-col items-center -translate-x-1/2">
                    <ArrowDown size={32} className="text-yellow-400 drop-shadow-glow animate-bounce" />
                    <span className="text-[10px] font-bold text-yellow-400 bg-black/60 px-2 rounded mt-1">GET!</span>
                </div>
             </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
