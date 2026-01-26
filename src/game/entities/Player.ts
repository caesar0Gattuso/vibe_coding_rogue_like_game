import { Entity } from './Entity';

export class Player extends Entity {
  constructor(x: number, y: number) {
    super(x, y, 0x3b82f6); // Blue color for player
    this.radius = 15;
    // Redraw with new radius
    this.visuals.clear();
    this.drawDefault(0x3b82f6);
  }

  public setInput(inputX: number, inputY: number) {
    // Normalize if diagonal to avoid faster speed
    if (inputX !== 0 || inputY !== 0) {
        const length = Math.sqrt(inputX * inputX + inputY * inputY);
        this.velocity.x = (inputX / length) * this.speed;
        this.velocity.y = (inputY / length) * this.speed;
    } else {
        this.velocity.x = 0;
        this.velocity.y = 0;
    }
  }
}
