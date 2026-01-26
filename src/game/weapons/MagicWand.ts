import { Weapon } from './Weapon';
import type { GameEngine } from '../core/GameEngine';
import { Bullet } from '../entities/Bullet';
import { useConfigStore } from '../../store/configStore';
import { Wand } from 'lucide-react'; 
// import { Texture } from 'pixi.js';

export class MagicWand extends Weapon {
// private glowTexture: Texture | null = null;

  constructor(game: GameEngine) {
    super(game, 'magic_wand', 'Magic Wand', {
      damage: 15,
      cooldown: 1.0, 
      range: 400,
      speed: 8,
      amount: 1,
    });
    this.description = 'Fires at nearest enemy.';
    this.icon = Wand;
    
    // Create a simple glow texture programmatically if not loading assets
    // For now, we rely on Bullet's default drawing, but we can enhance it
  }

  protected fire(): void {
    const player = this.game.getPlayer();
    const enemies = this.game.getEnemies();
    
    if (!player || !player.active || enemies.length === 0) return;

    const amount = this.stats.amount || 1;
    
    const sortedEnemies = [...enemies].sort((a, b) => {
        const distA = Math.pow(a.x - player.x, 2) + Math.pow(a.y - player.y, 2);
        const distB = Math.pow(b.x - player.x, 2) + Math.pow(b.y - player.y, 2);
        return distA - distB;
    });

    const targets = sortedEnemies.slice(0, amount);

    targets.forEach((target, index) => {
        setTimeout(() => {
            if (!player.active) return;
            const bullet = new Bullet(
                player.x,
                player.y,
                target.x - player.x,
                target.y - player.y,
                this.getDamage() + useConfigStore.getState().bulletDamage
            );
            bullet.speed = this.stats.speed;
            
            // Add a simple glow effect by drawing a larger, transparent circle behind
            // This is the "A" solution (Sprite/Graphics based glow)
            // @ts-ignore
            bullet.visuals.circle(0, 0, 8);
            // @ts-ignore
            bullet.visuals.fill({ color: 0xffff00, alpha: 0.3 }); // Glow

            this.game.addBullet(bullet);
        }, index * 100);
    });
  }

  public upgrade(): void {
    if (this.level >= this.maxLevel) return;
    this.level++;
    
    if (this.level % 2 === 0) {
        this.stats.damage += 5;
    } else {
        this.stats.amount = (this.stats.amount || 1) + 1;
    }
    
    this.stats.cooldown *= 0.9; 
  }
}
