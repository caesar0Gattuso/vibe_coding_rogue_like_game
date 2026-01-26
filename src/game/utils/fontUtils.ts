import { BitmapFont } from 'pixi.js';

export const initFonts = () => {
  // Pixi 8 approach for dynamic bitmap font
  // Note: Check docs if it's BitmapFont.install or similar. 
  // Based on agent research: BitmapFontManager.install or BitmapFont.install
  
  // Actually, standard Pixi 8 uses `BitmapFont.install`.
  BitmapFont.install({
    name: 'PixelFont',
    style: {
      fontFamily: 'Courier New', // Fallback to system monospace which looks pixel-y enough
      fontSize: 32,
      fill: 0xffffff,
      fontWeight: 'bold',
      stroke: { color: 0x000000, width: 4 }, // Thick outline for readability
      dropShadow: {
        alpha: 0.5,
        angle: Math.PI / 6,
        blur: 0, // Hard shadow for pixel feel
        color: 0x000000,
        distance: 2,
      },
    },
    chars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};:,./<>? '
  });
  
  // Crit Font (Yellow/Orange)
  BitmapFont.install({
    name: 'CritFont',
    style: {
      fontFamily: 'Courier New',
      fontSize: 48,
      fill: 0xffd700, // Gold
      fontWeight: 'bold',
      stroke: { color: 0x000000, width: 6 },
      dropShadow: {
        alpha: 0.8,
        angle: Math.PI / 6,
        blur: 0,
        color: 0x000000,
        distance: 4,
      },
    },
    chars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};:,./<>? '
  });
};
