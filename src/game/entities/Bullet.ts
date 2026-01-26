import { Entity } from './Entity';

export class Bullet extends Entity {
  public lifeTime: number = 100; // frames or time units
  public damage: number = 25; // Default damage

  constructor(x: number, y: number, dirX: number, dirY: number, damage: number) {
    super(x, y, 0xffff00); // Yellow
    this.speed = 8;
    this.radius = 4;
    this.damage = damage;
    this.visuals.clear();
    this.drawDefault(0xffff00);
    
    // Set fixed velocity
    const len = Math.sqrt(dirX * dirX + dirY * dirY);
    this.velocity.x = (dirX / len) * this.speed;
    this.velocity.y = (dirY / len) * this.speed;
  }

  public update(delta: number) {
    super.update(delta);
    this.lifeTime -= delta;
    if (this.lifeTime <= 0) {
      this.die();
    }
  }
}
