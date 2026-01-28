import { Entity } from './Entity';
import { Player } from './Player';
import { useGameStore, GameMode } from '../../store/gameStore';

export type EnemyType = 'chaser' | 'rusher' | 'tank';
export const EnemyType = {
  CHASER: 'chaser' as EnemyType,
  RUSHER: 'rusher' as EnemyType,
  TANK: 'tank' as EnemyType,
};

export class Enemy extends Entity {
  public type: EnemyType;
  private target: Player | null = null;
  private flashTimer: number = 0;
  private originalColor: number;
  
  // AI State for Rusher
  private chargeState: 'idle' | 'charging' | 'cooldown' = 'idle';
  private chargeTimer: number = 0;
  private chargeDir: { x: number, y: number } = { x: 0, y: 0 };

  constructor(x: number, y: number, type: EnemyType = EnemyType.CHASER) {
    let color = 0xef4444; // Default Red
    let radius = 12;
    let speed = 1.5;
    let hp = 100;

    switch (type) {
        case EnemyType.RUSHER:
            color = 0xf97316; // Orange
            radius = 10;
            speed = 1.0; // Base speed slow, burst fast
            hp = 60; // Low HP
            break;
        case EnemyType.TANK:
            color = 0xa855f7; // Purple
            radius = 18; // Big
            speed = 0.8; // Slow
            hp = 300; // High HP
            break;
        case EnemyType.CHASER:
        default:
            color = 0xef4444;
            radius = 12;
            speed = 1.5;
            hp = 100;
            break;
    }

    super(x, y, color);
    this.type = type;
    this.originalColor = color;
    this.speed = speed;
    this.radius = radius;
    this.maxHp = hp;
    this.hp = hp;

    this.visuals.clear();
    this.drawShape(color);
  }

  private drawShape(color: number) {
      this.visuals.clear();
      
      switch (this.type) {
          case EnemyType.RUSHER:
              // Triangle
              this.visuals.poly([
                  this.radius, 0,           // Nose (Right)
                  -this.radius, -this.radius, // Top Left
                  -this.radius, this.radius   // Bottom Left
              ]);
              break;
          case EnemyType.TANK:
              // Square
              this.visuals.rect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
              break;
          case EnemyType.CHASER:
          default:
              // Circle
              this.visuals.circle(0, 0, this.radius);
              break;
      }
      this.visuals.fill(color);
  }

  public setTarget(player: Player) {
    this.target = player;
  }

  public update(delta: number) {
    // Flash effect logic
    if (this.flashTimer > 0) {
      this.flashTimer -= delta / 60;
      if (this.flashTimer <= 0) {
         this.drawShape(this.originalColor);
      }
    }

    if (this.target && this.target.active) {
        this.updateAI(delta);
    }
    
    // Rotate towards velocity if moving (especially for triangle)
    // Only rotate if significant movement
    if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1) {
        this.rotation = Math.atan2(this.velocity.y, this.velocity.x);
    }

    super.update(delta);
  }

  private updateAI(delta: number) {
      if (!this.target) return;

      const mode = useGameStore.getState().currentMode;
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (mode === GameMode.PLATFORMER) {
          // Platformer Logic
          if (this.type === EnemyType.RUSHER) {
              switch (this.chargeState) {
                  case 'idle':
                      // Move slowly towards player X
                      if (Math.abs(dx) > 10) {
                          this.velocity.x = Math.sign(dx) * this.speed;
                      } else {
                          this.velocity.x = 0;
                      }
                      
                      // Trigger charge if close enough horizontally
                      if (Math.abs(dx) < 300 && Math.abs(dy) < 100) { 
                          this.chargeState = 'charging';
                          this.chargeTimer = 0.5; // 0.5s windup
                          this.velocity.x = 0;
                      }
                      break;
                      
                  case 'charging':
                      this.chargeTimer -= delta / 60;
                      if (this.chargeTimer <= 0) {
                          // Launch!
                          this.chargeDir = { x: Math.sign(dx) || 1, y: 0 };
                          this.velocity.x = this.chargeDir.x * (this.speed * 6);
                          
                          this.chargeState = 'cooldown';
                          this.chargeTimer = 1.0; 
                      }
                      break;
                      
                  case 'cooldown':
                      this.chargeTimer -= delta / 60;
                      this.velocity.x *= 0.95;
                      
                      if (this.chargeTimer <= 0) {
                          this.chargeState = 'idle';
                      }
                      break;
              }
          } else {
              // Standard Chaser/Tank
              // Move towards player X
              if (Math.abs(dx) > 5) {
                  this.velocity.x = Math.sign(dx) * this.speed;
              } else {
                  this.velocity.x = 0;
              }
              // Do NOT touch velocity.y, let gravity handle it
          }
      } else {
          // Top Down Logic (Original)
          if (this.type === EnemyType.RUSHER) {
              switch (this.chargeState) {
                  case 'idle':
                      if (dist > 0) {
                          this.velocity.x = (dx / dist) * this.speed;
                          this.velocity.y = (dy / dist) * this.speed;
                      }
                      if (dist < 200) {
                          this.chargeState = 'charging';
                          this.chargeTimer = 0.5; 
                          this.velocity.x = 0;
                          this.velocity.y = 0;
                      }
                      break;
                  case 'charging':
                      this.chargeTimer -= delta / 60;
                      if (this.chargeTimer <= 0) {
                          const angle = Math.atan2(dy, dx);
                          this.chargeDir = { x: Math.cos(angle), y: Math.sin(angle) };
                          this.velocity.x = this.chargeDir.x * (this.speed * 6); 
                          this.velocity.y = this.chargeDir.y * (this.speed * 6);
                          this.chargeState = 'cooldown';
                          this.chargeTimer = 1.0;
                      }
                      break;
                  case 'cooldown':
                      this.chargeTimer -= delta / 60;
                      this.velocity.x *= 0.95;
                      this.velocity.y *= 0.95;
                      if (this.chargeTimer <= 0) {
                          this.chargeState = 'idle';
                      }
                      break;
              }
          } else {
              // Standard Tracking
              if (dist > 0) {
                this.velocity.x = (dx / dist) * this.speed;
                this.velocity.y = (dy / dist) * this.speed;
              }
          }
      }
  }

  public takeDamage(amount: number) {
    super.takeDamage(amount);
    this.flash();
  }

  private flash() {
    this.visuals.clear();
    
    // Draw white shape
    switch (this.type) {
        case EnemyType.RUSHER:
            this.visuals.poly([ this.radius, 0, -this.radius, -this.radius, -this.radius, this.radius ]);
            break;
        case EnemyType.TANK:
            this.visuals.rect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
            break;
        case EnemyType.CHASER:
        default:
            this.visuals.circle(0, 0, this.radius);
            break;
    }
    
    this.visuals.fill(0xffffff); // White
    this.flashTimer = 0.1;
  }
}
