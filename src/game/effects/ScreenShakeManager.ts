import { Container } from 'pixi.js';

export class ScreenShakeManager {
  private container: Container;
  private shakeTimer: number = 0;
  private shakeIntensity: number = 0;
// @ts-ignore
// private originalPos: { x: number, y: number } = { x: 0, y: 0 };

  constructor(container: Container) {
    this.container = container;
  }

  public shake(intensity: number, duration: number) {
    this.shakeIntensity = intensity;
    this.shakeTimer = duration;
    // Store original only if not already shaking (to avoid drift)
    if (this.shakeTimer <= 0) {
        // this.originalPos = { x: this.container.x, y: this.container.y };
    }
  }

  public update(delta: number) {
    if (this.shakeTimer > 0) {
      this.shakeTimer -= delta / 60;
      
      const offsetX = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      const offsetY = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      
      this.container.x = offsetX;
      this.container.y = offsetY;

      if (this.shakeTimer <= 0) {
        this.container.x = 0;
        this.container.y = 0;
      }
    }
  }
}
