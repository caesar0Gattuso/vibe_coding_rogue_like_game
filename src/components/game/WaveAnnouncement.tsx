import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

export const WaveAnnouncement: React.FC = () => {
  const wave = useGameStore(state => state.wave);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (wave > 1) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [wave]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-40"
        >
          <div className="relative">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full scale-150" />
            
            {/* Main Text */}
            <h1 className="text-6xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] stroke-text">
              WAVE {wave}
            </h1>
            
            {/* Subtitle */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center text-white/80 font-bold tracking-[0.5em] mt-4 uppercase text-sm md:text-base"
            >
              Difficulty Increased
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
