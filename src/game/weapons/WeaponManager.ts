import { Weapon } from './Weapon';
import type { GameEngine } from '../core/GameEngine';

export class WeaponManager {
// @ts-ignore
// private game: GameEngine;
  public weapons: Weapon[] = [];
  public maxWeapons: number = 4;

  constructor(_game: GameEngine) {
    // this.game = game;
  }

  public update(delta: number) {
    for (const weapon of this.weapons) {
      weapon.update(delta);
    }
  }

  public addWeapon(weapon: Weapon): boolean {
    if (this.weapons.length >= this.maxWeapons) return false;
    
    // Check if already exists (should be handled by upgrade logic, but safety check)
    if (this.weapons.find(w => w.id === weapon.id)) return false;

    this.weapons.push(weapon);
    return true;
  }

  public getWeapon(id: string): Weapon | undefined {
    return this.weapons.find(w => w.id === id);
  }

  public hasWeapon(id: string): boolean {
    return !!this.getWeapon(id);
  }

  public isFull(): boolean {
    return this.weapons.length >= this.maxWeapons;
  }

  public upgradeWeapon(id: string) {
    const weapon = this.getWeapon(id);
    if (weapon && weapon.level < weapon.maxLevel) {
      weapon.upgrade();
    }
  }
}
