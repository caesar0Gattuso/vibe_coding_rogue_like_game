import { Container, Graphics } from 'pixi.js';

class Particle extends Graphics {
  public life: number = 0;
  public vx: number = 0;
  public vy: number = 0;
  public active: boolean = false;

  constructor() {
    super();
    this.rect(-2, -2, 4, 4); // 4x4 pixel particle
    this.fill(0xffffff);
  }

  reset(x: number, y: number, color: number, speed: number) {
    this.x = x;
    this.y = y;
    this.tint = color; // Graphics tinting works for single color fill
    this.alpha = 1;
    this.scale.set(1);
    this.life = 0.5 + Math.random() * 0.3; // Random life
    
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    
    this.active = true;
    this.visible = true;
  }

  update(delta: number) {
    if (!this.active) return;

    this.x += this.vx * delta;
    this.y += this.vy * delta;
    this.vy += 0.2 * delta; // Gravity
    
    this.life -= delta / 60;
    this.alpha = this.life * 2; // Fade out
    this.rotation += 0.1 * delta;

    if (this.life <= 0) {
      this.active = false;
      this.visible = false;
    }
  }
}

export class ParticleSystem extends Container {
  private pool: Particle[] = [];
  private activeParticles: Particle[] = [];

  constructor() {
    super();
    this.zIndex = 50; // Below UI, above ground
  }

  public emitExplosion(x: number, y: number, color: number, count: number = 8) {
    for (let i = 0; i < count; i++) {
        let p = this.pool.pop();
        if (!p) {
            p = new Particle();
            this.addChild(p);
        }
        
        const speed = 2 + Math.random() * 4;
        p.reset(x, y, color, speed);
        this.activeParticles.push(p);
    }
  }

  public update(delta: number) {
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const p = this.activeParticles[i];
      p.update(delta);
      if (!p.active) {
        this.activeParticles.splice(i, 1);
        this.pool.push(p);
      }
    }
  }
}
