import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum GameMode {
  TOP_DOWN = 'TOP_DOWN',
  PLATFORMER = 'PLATFORMER',
}

interface PlayerProgress {
  hp: number;
  maxHp: number;
  exp: number;
  maxExp: number;
  level: number;
  score: number;
  highScore: number;
  wave: number;
}

const initialProgress: PlayerProgress = {
  hp: 100,
  maxHp: 100,
  exp: 0,
  maxExp: 100,
  level: 1,
  score: 0,
  highScore: 0,
  wave: 1,
};

interface GameState extends PlayerProgress {
  isPaused: boolean;
  isLevelUp: boolean;
  isGameOver: boolean;
  
  currentMode: GameMode;
  topDownProgress: PlayerProgress;
  platformerProgress: PlayerProgress;

  setGameMode: (mode: GameMode) => void;
  setStats: (stats: Partial<GameState>) => void;
  addExp: (amount: number) => void;
  addScore: (amount: number) => void;
  togglePause: (paused?: boolean) => void;
  setLevelUp: (isLevelUp: boolean) => void;
  setGameOver: (isGameOver: boolean) => void;
  resetGame: () => void;
}

// Helper to extract progress from state
const extractProgress = (state: GameState): PlayerProgress => ({
  hp: state.hp,
  maxHp: state.maxHp,
  exp: state.exp,
  maxExp: state.maxExp,
  level: state.level,
  score: state.score,
  highScore: state.highScore,
  wave: state.wave,
});

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialProgress,
      isPaused: false,
      isLevelUp: false,
      isGameOver: false,
      
      currentMode: GameMode.TOP_DOWN,
      topDownProgress: { ...initialProgress },
      platformerProgress: { ...initialProgress },

      setGameMode: (mode) => {
        const state = get();
        // Save current progress to the appropriate slot
        const currentProgress = extractProgress(state);
        const updates: Partial<GameState> = { currentMode: mode };
        
        if (state.currentMode === GameMode.TOP_DOWN) {
          updates.topDownProgress = currentProgress;
        } else {
          updates.platformerProgress = currentProgress;
        }

        // Load new progress
        // We need to check if the target slot has data (it should, initialized)
        const nextProgress = mode === GameMode.TOP_DOWN ? (state.topDownProgress || initialProgress) : (state.platformerProgress || initialProgress);
        
        set({ ...updates, ...nextProgress, isGameOver: false, isPaused: false });
      },

      setStats: (stats) => set(stats),
      
      addScore: (amount) => set((state) => ({ score: state.score + amount })),

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

      setGameOver: (isGameOver) => {
        set((state) => {
            if (isGameOver && state.score > state.highScore) {
                return { isGameOver, isPaused: isGameOver, highScore: state.score };
            }
            return { isGameOver, isPaused: isGameOver };
        });
      },
      
      resetGame: () => {
          const state = get();
          set({
            ...initialProgress,
            highScore: state.highScore,
            // Preserve modes and slots, they will be updated on next persist/mode switch
          });
      }
    }),
    {
      name: 'rogue-gamestate',
      partialize: (state) => {
        // Sync current state to slot before saving
        const currentProgress = extractProgress(state);
        const topDown = state.currentMode === GameMode.TOP_DOWN ? currentProgress : state.topDownProgress;
        const platformer = state.currentMode === GameMode.PLATFORMER ? currentProgress : state.platformerProgress;

        return { 
            ...currentProgress,
            currentMode: state.currentMode,
            topDownProgress: topDown,
            platformerProgress: platformer
        } as unknown as GameState;
      },
    }
  )
);
