import { Entity } from './Entity';
import { Player } from './Player';
// import { Color } from 'pixi.js';

export class Enemy extends Entity {
  private target: Player | null = null;
  private flashTimer: number = 0;
  private originalColor: number;

  constructor(x: number, y: number) {
    super(x, y, 0xef4444); // Red color for enemy
    this.originalColor = 0xef4444;
    this.speed = 1.5;
    this.radius = 12;
    this.visuals.clear();
    this.drawDefault(this.originalColor);
  }

  public setTarget(player: Player) {
    this.target = player;
  }

  public update(delta: number) {
    // Flash effect
    if (this.flashTimer > 0) {
      this.flashTimer -= delta / 60;
      if (this.flashTimer <= 0) {
         this.visuals.clear();
         this.visuals.circle(0, 0, this.radius);
         this.visuals.fill(this.originalColor);
      }
    }

    if (this.target && this.target.active) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0) {
        this.velocity.x = (dx / dist) * this.speed;
        this.velocity.y = (dy / dist) * this.speed;
      }
    }
    super.update(delta);
  }

  public takeDamage(amount: number) {
    super.takeDamage(amount);
    this.flash();
  }

  private flash() {
    // To flash white on a colored graphics, we might need to redraw or use a shader.
    // Simple approach for Graphics: Change fill color temporarily
    
    this.visuals.clear();
    this.visuals.circle(0, 0, this.radius);
    this.visuals.fill(0xffffff); // White
    
    this.flashTimer = 0.1; // 0.1s flash
    
    // We need to restore color in update or via callback, but update is cleaner
  }

  // Override draw to handle flash reset
  public updateVisuals() {
     if (this.flashTimer <= 0) {
         this.visuals.clear();
         this.visuals.circle(0, 0, this.radius);
         this.visuals.fill(this.originalColor);
     }
  }
}
