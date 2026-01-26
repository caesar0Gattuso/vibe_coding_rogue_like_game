import { Container, BitmapText } from 'pixi.js';
import { initFonts } from '../utils/fontUtils';

// Initialize fonts once
initFonts();

class FloatingText extends BitmapText {
  public life: number = 0;
  public velocityY: number = -1;
  public active: boolean = false;

  constructor() {
    super({
        text: '', 
        style: {
            fontFamily: 'PixelFont', // Matches install name
            fontSize: 32 // Should match install size for crispness
        }
    });
    this.anchor.set(0.5);
  }

  reset(x: number, y: number, text: string, isCrit: boolean = false) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.style.fontFamily = isCrit ? 'CritFont' : 'PixelFont'; // Swap font for crit
    this.alpha = 1;
    this.scale.set(isCrit ? 1.2 : 0.8); // Adjust scale relative to font base size
    this.life = 0.8; // slightly faster fade
    this.active = true;
    this.visible = true;
    this.velocityY = isCrit ? -3 : -1.5; // Pop up faster on crit
  }

  update(delta: number) {
    if (!this.active) return;

    this.y += this.velocityY * delta;
    this.velocityY += 0.1 * delta; // Gravity effect for satisfying "pop"
    
    this.life -= delta / 60;

    if (this.life < 0.3) {
      this.alpha = this.life / 0.3;
    }

    if (this.life <= 0) {
      this.active = false;
      this.visible = false;
    }
  }
}

export class DamageTextManager extends Container {
  private pool: FloatingText[] = [];
  private activeTexts: FloatingText[] = [];

  constructor() {
    super();
    this.zIndex = 100; 
  }

  public showDamage(x: number, y: number, damage: number, isCrit: boolean = false) {
    let text = this.pool.pop();
    if (!text) {
      text = new FloatingText();
      this.addChild(text);
    }

    const value = Math.round(damage);
    const str = value.toString();

    text.reset(x, y - 20, str, isCrit);
    this.activeTexts.push(text);
  }

  public update(delta: number) {
    for (let i = this.activeTexts.length - 1; i >= 0; i--) {
      const text = this.activeTexts[i];
      text.update(delta);
      if (!text.active) {
        this.activeTexts.splice(i, 1);
        this.pool.push(text);
      }
    }
  }
}
