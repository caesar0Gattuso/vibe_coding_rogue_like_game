import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../../game/core/GameEngine';

export const GameCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const initGame = async () => {
        const game = GameEngine.getInstance();
        await game.init(containerRef.current!);
    };

    // Small delay to ensure layout is computed
    const timer = setTimeout(initGame, 100);

    return () => {
        clearTimeout(timer);
        // Do not destroy instance on unmount to preserve state for now, 
        // unless we are explicitly leaving the game view.
        // But if we return to menu, we might want to pause or destroy.
        // For this architecture, let's keep the singleton but ensure it's detached
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full bg-black"
    />
  );
};
