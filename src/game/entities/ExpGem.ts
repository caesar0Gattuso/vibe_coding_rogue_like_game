import { Entity } from './Entity';
import { Player } from './Player';

export class ExpGem extends Entity {
  public value: number;
  private isAttracted: boolean = false;
  private acceleration: number = 0.5;
  private currentSpeed: number = 0;
  private wobbleOffset: number = Math.random() * Math.PI * 2;
  
  // Colors
  private static readonly COLOR_SMALL = 0x3b82f6; // Blue 500
  private static readonly COLOR_MEDIUM = 0x22c55e; // Green 500
  private static readonly COLOR_LARGE = 0xa855f7; // Purple 500

  constructor(x: number, y: number, value: number) {
    // Determine color based on value
    let color = ExpGem.COLOR_SMALL;
    if (value >= 50) color = ExpGem.COLOR_LARGE;
    else if (value >= 20) color = ExpGem.COLOR_MEDIUM;

    super(x, y, color);
    this.value = value;
    this.radius = 6;
    
    // Override visuals for a diamond/gem shape
    this.visuals.clear();
    this.visuals.poly([
        0, -6, // Top
        6, 0,  // Right
        0, 6,  // Bottom
        -6, 0  // Left
    ]);
    this.visuals.fill(color);
    
    // Add a glow/stroke
    this.visuals.stroke({ width: 2, color: 0xffffff, alpha: 0.5 });
  }

  public update(delta: number, player?: Player, magnetRadius: number = 100) {
    if (!this.active) return;

    if (this.isAttracted && player) {
        // Homing missile logic
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angle = Math.atan2(dy, dx);
        
        // Accelerate towards player
        this.currentSpeed += this.acceleration * delta;
        // Cap speed if needed, but usually we want them to zoom fast at the end
        
        this.x += Math.cos(angle) * (this.currentSpeed + player.speed) * delta;
        this.y += Math.sin(angle) * (this.currentSpeed + player.speed) * delta;

    } else if (player) {
        // Idle animation (gentle float)
        this.wobbleOffset += 0.05 * delta;
        this.visuals.y = Math.sin(this.wobbleOffset) * 2;

        // Check magnet range
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distSq = dx * dx + dy * dy;
        
        if (distSq < magnetRadius * magnetRadius) {
            this.isAttracted = true;
            this.currentSpeed = 5; // Initial snap speed
        }
    }
  }
}
