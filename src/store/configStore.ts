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
}

interface ConfigStore extends GameConfig {
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
};

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_CONFIG,
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
