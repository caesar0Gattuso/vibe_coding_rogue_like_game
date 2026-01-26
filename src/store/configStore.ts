import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GameConfig {
  playerSpeed: number;
  playerHealth: number;
  enemySpawnRate: number; // seconds between spawns
  enemySpeed: number;
  bulletDamage: number;
  bulletSpeed: number;
  isGodMode: boolean;
  gameSpeed: number; // Time scale
  magnetRadius: number; // Pickup range
}

export interface TutorialState {
  hasMoved: boolean;
  hasAttacked: boolean;
  hasCollectedGem: boolean;
}

interface ConfigStore extends GameConfig {
  tutorial: TutorialState;
  completeTutorialStep: (step: keyof TutorialState) => void;
  resetTutorial: () => void;
  updateConfig: (key: keyof GameConfig, value: number | boolean) => void;
  resetConfig: () => void;
  exportConfig: () => string;
}

const DEFAULT_CONFIG: GameConfig = {
  playerSpeed: 3,
  playerHealth: 100,
  enemySpawnRate: 2,
  enemySpeed: 1,
  bulletDamage: 25,
  bulletSpeed: 5,
  isGodMode: false,
  gameSpeed: 1,
  magnetRadius: 100,
};

const DEFAULT_TUTORIAL: TutorialState = {
  hasMoved: false,
  hasAttacked: false,
  hasCollectedGem: false,
};

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_CONFIG,
      tutorial: DEFAULT_TUTORIAL,
      completeTutorialStep: (step) => set((state) => ({
        tutorial: { ...state.tutorial, [step]: true }
      })),
      resetTutorial: () => set({ tutorial: DEFAULT_TUTORIAL }),
      updateConfig: (key, value) => set({ [key]: value }),
      resetConfig: () => set(DEFAULT_CONFIG),
      exportConfig: () => JSON.stringify({
        ...get(),
        // Exclude methods from export
        updateConfig: undefined,
        resetConfig: undefined,
        exportConfig: undefined,
      }, null, 2),
    }),
    {
      name: 'rogue-config',
    }
  )
);
