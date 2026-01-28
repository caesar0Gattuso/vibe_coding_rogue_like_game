import { Container, Graphics, Point } from 'pixi.js';

export class Entity extends Container {
  public velocity: Point;
  public hp: number;
  public maxHp: number;
  public speed: number;
  public radius: number = 10;
  public active: boolean = true;
  
  // Physics properties
  public gravity: number = 0;
  public isGrounded: boolean = false;

  protected visuals: Graphics;

  constructor(x: number, y: number, color: number = 0xffffff) {
    super();
    this.x = x;
    this.y = y;
    this.velocity = new Point(0, 0);
    this.hp = 100;
    this.maxHp = 100;
    this.speed = 2;

    this.visuals = new Graphics();
    this.drawDefault(color);
    this.addChild(this.visuals);
  }

  protected drawDefault(color: number) {
    this.visuals.circle(0, 0, this.radius);
    this.visuals.fill(color);
  }

  public update(delta: number) {
    this.x += this.velocity.x * delta;
    this.y += this.velocity.y * delta;
  }

  public takeDamage(amount: number) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.die();
    }
  }

  public die() {
    this.active = false;
    this.removeFromParent();
  }
}
