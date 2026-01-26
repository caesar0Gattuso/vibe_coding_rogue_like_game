import { Weapon } from './Weapon';
import type { GameEngine } from '../core/GameEngine';
import { Entity } from '../entities/Entity';
import { Axe as AxeIcon } from 'lucide-react';
import { useConfigStore } from '../../store/configStore';

class AxeProjectile extends Entity {
  public velocityY: number;
  public gravity: number = 0.5;
  public damage: number;

  constructor(x: number, y: number, vx: number, vy: number, damage: number) {
    super(x, y, 0xff0000); // Red visuals overridden
    this.damage = damage;
    this.radius = 8;
    this.velocity.x = vx;
    this.velocityY = vy;
    
    // Visuals
    this.visuals.clear();
    this.visuals.rect(-8, -8, 16, 16); // Square axe
    this.visuals.fill(0xa16207); // Brownish
  }

  update(delta: number) {
    this.x += this.velocity.x * delta;
    this.y += this.velocityY * delta;
    this.velocityY += this.gravity * delta; // Gravity

    // Rotation effect
    this.visuals.rotation += 0.2 * delta;

    // Destroy if out of bounds (approx)
    if (this.y > 2000) { // arbitrary kill floor relative to spawn
        this.active = false;
        this.removeFromParent();
    }
  }
}

export class Axe extends Weapon {
  constructor(game: GameEngine) {
    super(game, 'axe', 'Throwing Axe', {
      damage: 40,
      cooldown: 1.5,
      range: 0, 
      speed: 5,
      amount: 1,
      area: 1
    });
    this.description = 'High damage, arcing trajectory.';
    this.icon = AxeIcon;
  }

  protected fire(): void {
    const player = this.game.getPlayer();
    if (!player || !player.active) return;

    const amount = this.stats.amount || 1;
    
    for (let i = 0; i < amount; i++) {
        // Spread axes if multiple
        const spread = (i - (amount - 1) / 2) * 2; // -2, 0, 2 for 3 axes
        
        const axe = new AxeProjectile(
            player.x, 
            player.y - 20, 
            (Math.random() - 0.5) * 2 + spread, // Random X + spread
            -12 - Math.random() * 2, // Upward force
            this.getDamage() + useConfigStore.getState().bulletDamage
        );
        
        // We need to manage these projectiles. 
        // For now, hackily add to game bullets or create new list. 
        // Let's add to bullets list in Game, but we need to patch Game to accept any Entity or specific Bullet interface
        // Since Bullet extends Entity and we just need update loop and collision...
        // Let's make AxeProjectile compatible or just use 'any' casting for MVP
        
        // @ts-ignore
        this.game.addBullet(axe); 
    }
  }

  public upgrade(): void {
    if (this.level >= this.maxLevel) return;
    this.level++;
    
    if (this.level % 2 === 0) {
        this.stats.amount = (this.stats.amount || 1) + 1;
    } else {
        this.stats.damage += 20;
        this.stats.area = (this.stats.area || 1) * 1.5; // Bigger axe
    }
  }
}
