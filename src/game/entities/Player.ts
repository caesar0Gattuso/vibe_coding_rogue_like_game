import { Entity } from './Entity';
import { useGameStore, GameMode } from '../../store/gameStore';

export class Player extends Entity {
  constructor(x: number, y: number) {
    super(x, y, 0x3b82f6); // Blue color for player
    this.radius = 15;
    // Redraw with new radius
    this.visuals.clear();
    this.drawDefault(0x3b82f6);
  }

  public setInput(inputX: number, inputY: number) {
    const mode = useGameStore.getState().currentMode;

    if (mode === GameMode.PLATFORMER) {
        // Platformer Control: Only X affects velocity directly
        // We use Math.sign or raw input. Raw input allows analog control if joystick.
        this.velocity.x = inputX * this.speed;
        
        // Jump Logic: inputY < -0.5 means Up/W is pressed
        if (inputY < -0.5) {
            this.jump();
        }
    } else {
        // Top Down Control: X/Y affect velocity directly
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

  public jump() {
      if (this.isGrounded) {
          // Jump force - needs to be tuned with gravity
          this.velocity.y = -15; 
          this.isGrounded = false;
      }
  }
}
