import { create } from 'zustand';

interface InventoryState {
  weapons: string[]; // Weapon IDs
  passives: string[]; // Passive IDs (not implemented yet, placeholder)
  
  addWeapon: (id: string) => void;
  hasWeapon: (id: string) => boolean;
  reset: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  weapons: ['magic_wand'], // Start with wand
  passives: [],
  
  addWeapon: (id) => {
    const { weapons } = get();
    if (!weapons.includes(id)) {
      set({ weapons: [...weapons, id] });
    }
  },
  
  hasWeapon: (id) => get().weapons.includes(id),
  
  reset: () => set({ weapons: ['magic_wand'], passives: [] })
}));
