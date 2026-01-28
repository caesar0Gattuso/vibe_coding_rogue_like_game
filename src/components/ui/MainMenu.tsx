import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { useGameStore, GameMode } from '../../store/gameStore';

interface MainMenuProps {
  onStart: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
  const { 
    setGameMode, 
    topDownProgress, 
    platformerProgress
  } = useGameStore();

  const handleSelectMode = (mode: GameMode) => {
    setGameMode(mode);
    onStart();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="max-w-4xl w-full flex flex-col items-center gap-6 md:gap-12 py-8 my-auto">
        <motion.h1 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-7xl font-bold text-center bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent flex-shrink-0"
        >
          VIBE ROGUE
        </motion.h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-3xl flex-shrink-0">
          {/* Top Down Mode Card */}
          <GlassCard 
            className="p-6 md:p-8 flex flex-col items-center gap-4 md:gap-6 hover:border-blue-500/50 hover:bg-blue-900/10 transition-all cursor-pointer group"
            onClick={() => handleSelectMode(GameMode.TOP_DOWN)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="h-24 md:h-40 w-full bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-xl flex items-center justify-center mb-1 md:mb-2 border border-blue-500/20 group-hover:border-blue-500/50">
               <span className="text-4xl md:text-6xl">🏹</span>
            </div>
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-blue-400 mb-1 md:mb-2">Classic Survival</h2>
              <p className="text-gray-400 text-xs md:text-sm">
                Top-down shooter. Survive endless waves in an open arena.
              </p>
            </div>
            <div className="flex gap-2 md:gap-4 text-xs md:text-sm mt-auto w-full justify-center">
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                Lvl {topDownProgress?.level || 1}
              </div>
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                Hi-Score: {topDownProgress?.highScore || 0}
              </div>
            </div>
            <Button className="w-full mt-2 group-hover:bg-blue-600" size="sm">Play Classic</Button>
          </GlassCard>

          {/* Platformer Mode Card */}
          <GlassCard 
            className="p-6 md:p-8 flex flex-col items-center gap-4 md:gap-6 hover:border-purple-500/50 hover:bg-purple-900/10 transition-all cursor-pointer group"
            onClick={() => handleSelectMode(GameMode.PLATFORMER)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="h-24 md:h-40 w-full bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl flex items-center justify-center mb-1 md:mb-2 border border-purple-500/20 group-hover:border-purple-500/50">
               <span className="text-4xl md:text-6xl">🏃</span>
            </div>
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-1 md:mb-2">Adventure Run</h2>
              <p className="text-gray-400 text-xs md:text-sm">
                Side-scrolling platformer. Jump, shoot, and survive gravity.
              </p>
            </div>
            <div className="flex gap-2 md:gap-4 text-xs md:text-sm mt-auto w-full justify-center">
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                Lvl {platformerProgress?.level || 1}
              </div>
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                Hi-Score: {platformerProgress?.highScore || 0}
              </div>
            </div>
            <Button className="w-full mt-2 group-hover:bg-purple-600" variant="secondary" size="sm">Play Adventure</Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
