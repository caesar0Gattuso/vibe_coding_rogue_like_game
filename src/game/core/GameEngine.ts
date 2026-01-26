import { Application, Container } from 'pixi.js';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { Entity } from '../entities/Entity';
import { useConfigStore } from '../../store/configStore';
import { useGameStore } from '../../store/gameStore';
import { WeaponManager } from '../weapons/WeaponManager';
import { MagicWand } from '../weapons/MagicWand';
import { DamageTextManager } from '../effects/DamageTextManager';
import { ParticleSystem } from '../effects/ParticleSystem';
import { ScreenShakeManager } from '../effects/ScreenShakeManager';
// import { useInventoryStore } from '../../store/inventoryStore';

export class GameEngine {
  private static instance: GameEngine;
  public app: Application;
  // private container: HTMLElement | null = null;
  private isInitialized = false;

  private gameContainer: Container;
  
  private player: Player | null = null;
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  
  private weaponManager: WeaponManager;
  private damageTextManager: DamageTextManager;
  private particleSystem: ParticleSystem;
  private screenShakeManager: ScreenShakeManager;

  private keys: { [key: string]: boolean } = {};
  
  private joystickInput: { x: number, y: number } = { x: 0, y: 0 };
  
  private enemySpawnTimer: number = 0;

  private constructor() {
    this.app = new Application();
    this.gameContainer = new Container();
    // @ts-ignore - Temporary cast until we update WeaponManager
    this.weaponManager = new WeaponManager(this as any); 
    this.damageTextManager = new DamageTextManager();
    this.particleSystem = new ParticleSystem();
    this.screenShakeManager = new ScreenShakeManager(this.gameContainer);
  }

  public static getInstance(): GameEngine {
    if (!GameEngine.instance) {
        GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance;
  }

  public async init(container: HTMLElement) {
    if (this.isInitialized) {
      if (this.app.canvas && this.app.canvas.parentElement !== container) {
        container.appendChild(this.app.canvas);
      }
      this.app.renderer.resize(container.clientWidth, container.clientHeight);
      return;
    }
    
    // this.container = container;

    if (container.clientWidth === 0 || container.clientHeight === 0) {
        console.warn("Container has no dimensions, waiting...");
    }

    await this.app.init({
      resizeTo: container,
      width: container.clientWidth || window.innerWidth,
      height: container.clientHeight || window.innerHeight,
      backgroundColor: 0x1a1a1a,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: false,
    });

    container.appendChild(this.app.canvas);
    this.app.stage.addChild(this.gameContainer);
    this.app.stage.addChild(this.particleSystem); // Particles below text
    this.app.stage.addChild(this.damageTextManager); // Text on top

    this.startNewGame();
    this.setupInput();
    
    this.isInitialized = true;
    this.startGameLoop();
  }

  public setJoystickInput(x: number, y: number) {
      this.joystickInput = { x, y };
  }

  private startNewGame() {
      // Reset State
      this.enemies.forEach(e => e.die());
      this.bullets.forEach(b => b.die());
      this.enemies = [];
      this.bullets = [];
      this.gameContainer.removeChildren();
      
      // Reset Store
      useGameStore.getState().setStats({ hp: 100, score: 0, level: 1, exp: 0 });
      useGameStore.getState().setGameOver(false);

      // Create Player
      const { width, height } = this.app.screen;
      this.player = new Player(width / 2, height / 2);
      this.gameContainer.addChild(this.player);

      // Reset Weapons
      this.weaponManager.weapons = [];
      this.weaponManager.addWeapon(new MagicWand(this as any)); // Default weapon
  }

  private setupInput() {
      window.addEventListener('keydown', (e) => this.keys[e.key] = true);
      window.addEventListener('keyup', (e) => this.keys[e.key] = false);
  }

  private startGameLoop() {
      this.app.ticker.add((ticker) => {
          if (useGameStore.getState().isGameOver) return;
          if (useGameStore.getState().isPaused) return;

          // Convert ticker.deltaTime to something close to 1.0 at 60fps
          this.update(ticker.deltaTime);
      });
  }

  private update(delta: number) {
    if (!this.player || !this.player.active) return;

    const config = useConfigStore.getState();

    // 1. Player Input & Stats
    this.player.speed = config.playerSpeed;
    this.player.maxHp = config.playerHealth;
    
    let dx = 0;
    let dy = 0;
    if (this.keys['w'] || this.keys['ArrowUp']) dy -= 1;
    if (this.keys['s'] || this.keys['ArrowDown']) dy += 1;
    if (this.keys['a'] || this.keys['ArrowLeft']) dx -= 1;
    if (this.keys['d'] || this.keys['ArrowRight']) dx += 1;
    
    if (this.joystickInput.x !== 0 || this.joystickInput.y !== 0) {
        dx += this.joystickInput.x;
        dy += this.joystickInput.y;
    }

    this.player.setInput(dx, dy);
    this.player.update(delta);
    this.constrainPlayer();

    // 2. Enemy Spawning
    this.enemySpawnTimer += delta / 60; 
    if (this.enemySpawnTimer >= config.enemySpawnRate) {
        this.spawnEnemy();
        this.enemySpawnTimer = 0;
    }

    // 3. Weapons
    this.weaponManager.update(delta);

    // 4. Update Entities & Collision
    this.updateEnemies(delta);
    this.updateBullets(delta);
    
    // 5. Effects
    this.damageTextManager.update(delta);
    this.particleSystem.update(delta);
    this.screenShakeManager.update(delta);
  }

  private constrainPlayer() {
      if (!this.player) return;
      const r = this.player.radius;
      const { width, height } = this.app.screen;
      this.player.x = Math.max(r, Math.min(width - r, this.player.x));
      this.player.y = Math.max(r, Math.min(height - r, this.player.y));
  }

  private spawnEnemy() {
      const { width, height } = this.app.screen;
      // Spawn at edges
      let x, y;
      if (Math.random() < 0.5) {
          x = Math.random() < 0.5 ? -20 : width + 20;
          y = Math.random() * height;
      } else {
          x = Math.random() * width;
          y = Math.random() < 0.5 ? -20 : height + 20;
      }
      
      const enemy = new Enemy(x, y);
      if (this.player) enemy.setTarget(this.player);
      this.enemies.push(enemy);
      this.gameContainer.addChild(enemy);
  }

  public getPlayer() { return this.player; }
  public getEnemies() { return this.enemies; }
  public getWeaponManager() { return this.weaponManager; }
  
  public addBullet(bullet: Bullet) {
      this.bullets.push(bullet);
      this.gameContainer.addChild(bullet);
  }

  public getDamageTextManager() { return this.damageTextManager; }
  public getParticleSystem() { return this.particleSystem; }
  public getScreenShakeManager() { return this.screenShakeManager; }

  private updateEnemies(delta: number) {
      const config = useConfigStore.getState();
      
      for (let i = this.enemies.length - 1; i >= 0; i--) {
          const enemy = this.enemies[i];
          enemy.speed = config.enemySpeed; // Live update speed
          enemy.update(delta);
          
          // Collision with Player
          if (this.player && this.checkCollision(enemy, this.player)) {
              if (!config.isGodMode) {
                  const gameState = useGameStore.getState();
                  const newHp = gameState.hp - 0.5 * delta; // Damage over time
                  if (newHp <= 0) {
                      useGameStore.getState().setStats({ hp: 0 });
                      useGameStore.getState().setGameOver(true);
                  } else {
                      useGameStore.getState().setStats({ hp: newHp });
                      this.screenShakeManager.shake(2, 0.2); // Shake on damage
                  }
              }
          }
          
          if (!enemy.active) {
              this.enemies.splice(i, 1);
          }
      }
  }

  private updateBullets(delta: number) {
      for (let i = this.bullets.length - 1; i >= 0; i--) {
          const bullet = this.bullets[i];
          bullet.update(delta);
          
          for (const enemy of this.enemies) {
              if (enemy.active && this.checkCollision(bullet, enemy)) {
                  const damage = bullet['damage'] || useConfigStore.getState().bulletDamage; 
                  
                  // Critical Hit Logic (Simple 10% chance)
                  const isCrit = Math.random() < 0.1;
                  const finalDamage = isCrit ? damage * 2 : damage;

                  enemy.takeDamage(finalDamage);
                  this.damageTextManager.showDamage(enemy.x, enemy.y, finalDamage, isCrit);
                  
                  if (isCrit) {
                      this.screenShakeManager.shake(1, 0.1); // Tiny shake on crit
                  }
                  
                  if (!enemy.active) {
                      useGameStore.getState().addExp(20);
                      this.particleSystem.emitExplosion(enemy.x, enemy.y, 0xef4444); // Red explosion
                  }
                  bullet.die();
                  break;
              }
          }
          
          if (!bullet.active) {
              this.bullets.splice(i, 1);
          }
      }
  }

  private checkCollision(a: Entity, b: Entity): boolean {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist < (a.radius + b.radius);
  }

  public destroy() {
      if (this.app) {
          this.app.destroy({ removeView: true }, { children: true, texture: true });
      }
      this.isInitialized = false;
      GameEngine.instance = null as any;
  }
}
