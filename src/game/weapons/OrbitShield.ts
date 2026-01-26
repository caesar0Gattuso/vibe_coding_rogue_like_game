import { Weapon } from './Weapon';
import type { GameEngine } from '../core/GameEngine';
import { Graphics } from 'pixi.js';
import { Shield } from 'lucide-react';

export class OrbitShield extends Weapon {
  // private shieldVisuals: Graphics[] = [];
  private rotation: number = 0;
  private container: Graphics;

  constructor(game: GameEngine) {
    super(game, 'orbit_shield', 'Orbit Shield', {
      damage: 10,
      cooldown: 0.5, // Tick rate
      range: 80, // Distance from player
      speed: 2, // Rotation speed
      amount: 1, // Number of shields
      area: 1 // Size multiplier
    });
    this.description = 'Orbits around you, damaging enemies.';
    this.icon = Shield;
    
    this.container = new Graphics();
    this.game.app.stage.addChild(this.container);
    this.createShields();
  }

  private createShields() {
    this.container.clear();
    // this.shieldVisuals = [];
    const amount = this.stats.amount || 1;
    
    // We are just drawing them relative to container, update container position
  }

  public update(delta: number) {
    super.update(delta);
    
    const player = this.game.getPlayer();
    if (!player || !player.active) {
        this.container.visible = false;
        return;
    }

    this.container.visible = true;
    this.container.x = player.x;
    this.container.y = player.y;
    
    this.rotation += (this.stats.speed * delta) / 60;
    
    // Draw shields
    this.container.clear();
    const amount = this.stats.amount || 1;
    const radius = this.stats.range;
    
    for (let i = 0; i < amount; i++) {
        const angle = this.rotation + (i * (Math.PI * 2 / amount));
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        // Draw shield ball
        this.container.circle(x, y, 10 * (this.stats.area || 1));
        this.container.fill(0x60a5fa); // Light blue
        
        // Collision check - manually check enemies against these points
        // Optimization: Don't check every frame if tick rate is low, 
        // but here we want continuous visual, maybe discrete damage tick.
        // For simplicity, let's just check damage on 'fire' tick
    }
  }

  protected fire(): void {
    // This is the damage tick
    const player = this.game.getPlayer();
    if (!player) return;

    const enemies = this.game.getEnemies();
    const amount = this.stats.amount || 1;
    const radius = this.stats.range;
    const hitRadius = 15 * (this.stats.area || 1); // Shield size + enemy radius approx

    let hitCount = 0;

    for (let i = 0; i < amount; i++) {
        const angle = this.rotation + (i * (Math.PI * 2 / amount));
        // Calculate world position of this shield
        const sx = player.x + Math.cos(angle) * radius;
        const sy = player.y + Math.sin(angle) * radius;

        for (const enemy of enemies) {
            if (!enemy.active) continue;
            
            const dx = enemy.x - sx;
            const dy = enemy.y - sy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < hitRadius + enemy.radius) {
                // Apply Damage
                enemy.takeDamage(this.getDamage());
                // Knockback
                const knockDir = Math.atan2(enemy.y - player.y, enemy.x - player.x);
                enemy.x += Math.cos(knockDir) * 10;
                enemy.y += Math.sin(knockDir) * 10;
                
                // Show damage text (via game instance)
                this.game.getDamageTextManager().showDamage(enemy.x, enemy.y, this.getDamage());
                
                hitCount++;
            }
        }
    }
  }

  public upgrade(): void {
    if (this.level >= this.maxLevel) return;
    this.level++;
    
    if (this.level % 2 === 0) {
        this.stats.amount = (this.stats.amount || 1) + 1;
    } else {
        this.stats.damage += 5;
        this.stats.range += 10;
        this.stats.area = (this.stats.area || 1) * 1.2;
    }
  }
}
