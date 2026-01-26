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
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full bg-black"
    />
  );
};
