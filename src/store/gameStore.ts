import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  hp: number;
  maxHp: number;
  exp: number;
  maxExp: number;
  level: number;
  isPaused: boolean;
  isLevelUp: boolean;
  isGameOver: boolean;
  score: number;
  wave: number;
  
  setStats: (stats: Partial<GameState>) => void;
  addExp: (amount: number) => void;
  togglePause: (paused?: boolean) => void;
  setLevelUp: (isLevelUp: boolean) => void;
  setGameOver: (isGameOver: boolean) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      hp: 100,
      maxHp: 100,
      exp: 0,
      maxExp: 100,
      level: 1,
      isPaused: false,
      isLevelUp: false,
      isGameOver: false,
      score: 0,
      wave: 1,

      setStats: (stats) => set(stats),
      
      addExp: (amount) => {
        const { exp, maxExp, level } = get();
        let newExp = exp + amount;
        
        if (newExp >= maxExp) {
          set({ 
            exp: newExp - maxExp, 
            maxExp: Math.floor(maxExp * 1.5), 
            level: level + 1,
            isLevelUp: true,
            isPaused: true
          });
        } else {
          set({ exp: newExp });
        }
      },
      
      togglePause: (paused) => set((state) => ({ isPaused: paused ?? !state.isPaused })),
      
      setLevelUp: (isLevelUp) => set({ isLevelUp, isPaused: isLevelUp }),

      setGameOver: (isGameOver) => set({ isGameOver, isPaused: isGameOver }),
      
      resetGame: () => set({
        hp: 100,
        maxHp: 100,
        exp: 0,
        maxExp: 100,
        level: 1,
        isPaused: false,
        isLevelUp: false,
        isGameOver: false,
        score: 0,
        wave: 1
      })
    }),
    {
      name: 'rogue-gamestate',
      partialize: (state) => ({ 
        // Only save persistent progression data
        hp: state.hp,
        maxHp: state.maxHp,
        exp: state.exp,
        maxExp: state.maxExp,
        level: state.level,
        score: state.score,
        wave: state.wave
      }),
    }
  )
);
