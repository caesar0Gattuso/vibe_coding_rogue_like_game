import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Home } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

export const GameOverModal: React.FC = () => {
  const { isGameOver, resetGame, score, wave } = useGameStore();

  if (!isGameOver) return null;

  const handleRestart = () => {
    resetGame();
    // Ideally we also reset the Game instance state (entities), but for now Game loop handles it via health check or we can force reload
    window.location.reload(); 
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
      >
        <GlassCard className="w-full max-w-sm p-8 text-center space-y-6 bg-red-900/20 border-red-500/30">
          <motion.h2 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-black text-red-500 uppercase tracking-widest"
          >
            Game Over
          </motion.h2>
          
          <div className="space-y-2 text-white/80">
            <p className="text-lg">You survived until Wave <span className="text-white font-bold">{wave}</span></p>
            <p className="text-sm">Score: {score}</p>
          </div>

          <div className="pt-4 space-y-3">
            <Button variant="primary" className="w-full bg-red-600 hover:bg-red-500" onClick={handleRestart}>
              <RefreshCw size={20} /> Try Again
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => window.location.reload()}>
              <Home size={20} /> Main Menu
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
};
