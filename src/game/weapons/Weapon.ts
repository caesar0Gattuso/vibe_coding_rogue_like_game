// import { Container } from 'pixi.js';
import type { GameEngine } from '../core/GameEngine';

export interface WeaponStats {
  damage: number;
  cooldown: number; // seconds
  range: number;
  speed: number;
  duration?: number;
  amount?: number;
  area?: number; // scale multiplier
}

export abstract class Weapon {
  public id: string;
  public name: string;
  public description: string;
  public level: number = 1;
  public maxLevel: number = 5;
  public icon: any; // Lucide icon or sprite path

  protected game: GameEngine;
  protected stats: WeaponStats;
  protected cooldownTimer: number = 0;

  constructor(game: GameEngine, id: string, name: string, stats: WeaponStats) {
    this.game = game;
    this.id = id;
    this.name = name;
    this.stats = stats;
    this.description = '';
  }

  public update(delta: number) {
    this.cooldownTimer -= delta / 60; // Assuming 60fps base
    if (this.cooldownTimer <= 0) {
      this.fire();
      this.cooldownTimer = this.getCooldown();
    }
  }

  protected abstract fire(): void;

  public abstract upgrade(): void;

  public getStats(): WeaponStats {
    return this.stats;
  }

  protected getCooldown(): number {
    // Can apply global cooldown reduction here
    return this.stats.cooldown;
  }

  public getDamage(): number {
    // Can apply global damage modifiers here
    return this.stats.damage;
  }
}
