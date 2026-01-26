import { Application, Container } from 'pixi.js';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { Entity } from '../entities/Entity';
import { ExpGem } from '../entities/ExpGem';
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
// @ts-ignore
// private container: HTMLElement | null = null;
  private isInitialized = false;

  private gameContainer: Container;
  
  private player: Player | null = null;
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private expGems: ExpGem[] = [];
  
  private weaponManager: WeaponManager;
  private damageTextManager: DamageTextManager;
  private particleSystem: ParticleSystem;
  private screenShakeManager: ScreenShakeManager;

  private keys: { [key: string]: boolean } = {};
  
  private joystickInput: { x: number, y: number } = { x: 0, y: 0 };
  
  private enemySpawnTimer: number = 0;
  private waveTimer: number = 0;
  private readonly WAVE_DURATION: number = 60; // 60 seconds per wave

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
      // Check if we should actually reset (e.g. if it's a fresh load vs a reload)
      // For now, let's trust the persisted store state unless it's explicitly Game Over or Level 1/0 XP
      const state = useGameStore.getState();
      const shouldReset = state.isGameOver || (state.level === 1 && state.exp === 0 && state.wave === 1);

      if (shouldReset) {
          // Reset Store
          useGameStore.getState().resetGame();
          useGameStore.getState().setGameOver(false);
          // Also reset weapon inventory? usually yes for rogue-lite runs
          // useInventoryStore.getState().reset(); // need to implement this
      }

      // Reset Entities (Visuals need to be rebuilt regardless of state)
      this.enemies.forEach(e => e.die());
      this.bullets.forEach(b => b.die());
      this.expGems.forEach(g => g.die());
      this.enemies = [];
      this.bullets = [];
      this.expGems = [];
      this.gameContainer.removeChildren();
      this.waveTimer = 0; // Note: if we want to persist exact wave time, we need to save it in store
      
      // Create Player
      const { width, height } = this.app.screen;
      this.player = new Player(width / 2, height / 2);
      this.gameContainer.addChild(this.player);

      // Restore Weapons from Inventory Store if not resetting
      // TODO: properly sync WeaponManager with InventoryStore on load
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
    const level = useGameStore.getState().level;
    const speedMult = config.speedMultiplier + ((level - 1) * config.speedPerLevel);

    this.player.speed = config.playerSpeed * speedMult;
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
    this.waveTimer += delta / 60;
    if (this.waveTimer >= this.WAVE_DURATION) {
        this.waveTimer = 0;
        const currentWave = useGameStore.getState().wave;
        useGameStore.getState().setStats({ wave: currentWave + 1 });
        // Optional: Heal player slightly on wave up?
    }

    this.enemySpawnTimer += delta / 60; 
    const currentWave = useGameStore.getState().wave;
    // Spawn rate decreases (gets faster) as wave increases. Min cap 0.2s
    const spawnRate = Math.max(0.2, config.enemySpawnRate - ((currentWave - 1) * 0.1));
    
    if (this.enemySpawnTimer >= spawnRate) {
        this.spawnEnemy();
        this.enemySpawnTimer = 0;
    }

    // 3. Weapons
    this.weaponManager.update(delta);

    // 4. Update Entities & Collision
    this.updateEnemies(delta);
    this.updateBullets(delta);
    this.updateExpGems(delta);
    
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
      
      // Scale Enemy Stats based on Wave
      const wave = useGameStore.getState().wave;
      // +20% HP per wave
      enemy.maxHp = enemy.maxHp * (1 + (wave - 1) * 0.2); 
      enemy.hp = enemy.maxHp;
      // +5% Speed per wave (capped at some point?)
      // Note: Enemy.speed is also overridden in updateEnemies by config, so we need to handle that there or remove the override
      
      if (this.player) enemy.setTarget(this.player);
      this.enemies.push(enemy);
      this.gameContainer.addChild(enemy);
  }

  public getPlayer() { return this.player; }
  public getEnemies() { return this.enemies; }
  public getWeaponManager() { return this.weaponManager; }
  public getExpGems() { return this.expGems; }
  
  public addBullet(bullet: Bullet) {
      this.bullets.push(bullet);
      this.gameContainer.addChild(bullet);
  }

  public getDamageTextManager() { return this.damageTextManager; }
  public getParticleSystem() { return this.particleSystem; }
  public getScreenShakeManager() { return this.screenShakeManager; }
  public getWaveProgress() { return Math.min(1, this.waveTimer / this.WAVE_DURATION); }

  private updateEnemies(delta: number) {
      const config = useConfigStore.getState();
      
      for (let i = this.enemies.length - 1; i >= 0; i--) {
          const enemy = this.enemies[i];
          // enemy.speed = config.enemySpeed; // Removed override to allow per-enemy scaling if needed, or apply scaling here
          const wave = useGameStore.getState().wave;
          enemy.speed = config.enemySpeed * (1 + (wave - 1) * 0.05);

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
                  const config = useConfigStore.getState();
                  if (!config.tutorial.hasAttacked) {
                      config.completeTutorialStep('hasAttacked');
                  }

                  const level = useGameStore.getState().level;
                  const damageMult = config.damageMultiplier + ((level - 1) * config.damagePerLevel);

                  const baseDamage = bullet['damage'] || config.bulletDamage; 
                  const damage = baseDamage * damageMult; 
                  
                  // Critical Hit Logic (Simple 10% chance)
                  const isCrit = Math.random() < 0.1;
                  const finalDamage = isCrit ? damage * 2 : damage;

                  enemy.takeDamage(finalDamage);
                  this.damageTextManager.showDamage(enemy.x, enemy.y, finalDamage, isCrit);
                  
                  if (isCrit) {
                      this.screenShakeManager.shake(1, 0.1); // Tiny shake on crit
                  }
                  
                  if (!enemy.active) {
                      // useGameStore.getState().addExp(20); // Old instant exp
                      this.spawnExpGem(enemy.x, enemy.y, 20);
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

  private spawnExpGem(x: number, y: number, value: number) {
      const gem = new ExpGem(x, y, value);
      this.expGems.push(gem);
      this.gameContainer.addChildAt(gem, 0); // Render gems below enemies/player
  }

  private updateExpGems(delta: number) {
      if (!this.player) return;
      const config = useConfigStore.getState();

      for (let i = this.expGems.length - 1; i >= 0; i--) {
          const gem = this.expGems[i];
          gem.update(delta, this.player, config.magnetRadius);

          // Check pickup
          if (this.checkCollision(gem, this.player)) {
              if (!config.tutorial.hasCollectedGem) {
                  useConfigStore.getState().completeTutorialStep('hasCollectedGem');
              }
              
              useGameStore.getState().addExp(gem.value);
              // Optional: Add pickup sound or tiny sparkle
              gem.die();
              this.expGems.splice(i, 1);
          }
      }
  }
}
