import { Application, Container } from 'pixi.js';
import { Player } from '../entities/Player';
import { Enemy, EnemyType } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { Entity } from '../entities/Entity';
import { ExpGem } from '../entities/ExpGem';
import { useConfigStore } from '../../store/configStore';
import { useGameStore, GameMode } from '../../store/gameStore';
import { WeaponManager } from '../weapons/WeaponManager';
import { MagicWand } from '../weapons/MagicWand';
import { DamageTextManager } from '../effects/DamageTextManager';
import { ParticleSystem } from '../effects/ParticleSystem';
import { ScreenShakeManager } from '../effects/ScreenShakeManager';

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

  // Physics Config
  private readonly GRAVITY = 0.5;
  private readonly GROUND_Y_OFFSET = 50;

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
      
      // Force restart if re-initializing to ensure clean state for potential mode switch
      this.restart();
      
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
  
  public restart() {
      // Clear all entities
      this.enemies.forEach(e => e.die());
      this.bullets.forEach(b => b.die());
      this.expGems.forEach(g => g.die());
      this.enemies = [];
      this.bullets = [];
      this.expGems = [];
      
      this.gameContainer.removeChildren();
      
      // Reset logic
      this.startNewGame();
  }

  private startNewGame() {
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
      
      // If platformer, ensure player starts on ground
      if (state.currentMode === GameMode.PLATFORMER) {
          const groundLevel = height - this.GROUND_Y_OFFSET;
          this.player.y = groundLevel - this.player.radius;
      }
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
    const gameState = useGameStore.getState();
    const mode = gameState.currentMode;

    // Physics
    if (mode === GameMode.PLATFORMER) {
        this.applyPhysics(this.player, delta);
        this.enemies.forEach(e => this.applyPhysics(e, delta));
        this.expGems.forEach(g => this.applyPhysics(g, delta));
    }

    // 1. Player Input & Stats
    const level = gameState.level;
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
        const currentWave = gameState.wave;
        gameState.setStats({ wave: currentWave + 1 });
        // Wave Complete Bonus
        gameState.addScore(currentWave * 100);
    }

    this.enemySpawnTimer += delta / 60; 
    const currentWave = gameState.wave;
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

  private applyPhysics(entity: Entity, delta: number) {
      // Apply Gravity
      entity.velocity.y += this.GRAVITY * delta;
      
      // Ground Collision
      const { height } = this.app.screen;
      const groundLevel = height - this.GROUND_Y_OFFSET;
      
      if (entity.y + entity.radius >= groundLevel) {
          entity.y = groundLevel - entity.radius;
          // Stop downward velocity, but allow upward (jump start)
          if (entity.velocity.y > 0) {
              entity.velocity.y = 0;
              entity.isGrounded = true;
          }
      } else {
          entity.isGrounded = false;
      }
  }

  private constrainPlayer() {
      if (!this.player) return;
      const r = this.player.radius;
      const { width, height } = this.app.screen;

      this.player.x = Math.max(r, Math.min(width - r, this.player.x));
      
      const mode = useGameStore.getState().currentMode;
      if (mode === GameMode.PLATFORMER) {
          // In platformer, just constrain top and bottom safety
           this.player.y = Math.max(r, this.player.y);
           this.player.y = Math.min(height - this.GROUND_Y_OFFSET - r + 5, this.player.y);
      } else {
          this.player.y = Math.max(r, Math.min(height - r, this.player.y));
      }
  }

  private spawnEnemy() {
      const { width, height } = this.app.screen;
      const mode = useGameStore.getState().currentMode;
      
      let x, y;
      
      if (mode === GameMode.PLATFORMER) {
          // Spawn at edges, ground level
          const groundY = height - this.GROUND_Y_OFFSET;
          const spawnLeft = Math.random() < 0.5;
          x = spawnLeft ? -30 : width + 30;
          y = groundY - 20; // Approx logic
      } else {
          // Top Down Spawn
          if (Math.random() < 0.5) {
              x = Math.random() < 0.5 ? -20 : width + 20;
              y = Math.random() * height;
          } else {
              x = Math.random() * width;
              y = Math.random() < 0.5 ? -20 : height + 20;
          }
      }

      // Determine Enemy Type based on Wave
      const wave = useGameStore.getState().wave;
      let type = EnemyType.CHASER;
      
      const rand = Math.random();
      
      if (wave >= 5) {
          // Wave 5+: Chaser (60%), Rusher (20%), Tank (20%)
          if (rand < 0.6) type = EnemyType.CHASER;
          else if (rand < 0.8) type = EnemyType.RUSHER;
          else type = EnemyType.TANK;
      } else if (wave >= 3) {
          // Wave 3-4: Chaser (80%), Rusher (20%)
          if (rand < 0.8) type = EnemyType.CHASER;
          else type = EnemyType.RUSHER;
      }
      // Wave 1-2: 100% Chaser

      const enemy = new Enemy(x, y, type);
      
      // Scale Enemy Stats based on Wave
      enemy.maxHp = enemy.maxHp * (1 + (wave - 1) * 0.2); 
      enemy.hp = enemy.maxHp;
      const config = useConfigStore.getState();
      enemy.speed = enemy.speed * (1 + (wave - 1) * 0.05) * config.enemySpeed; 
      
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
          // enemy.speed logic handled in spawn/constructor + AI update
          
          enemy.update(delta);
          
          // Collision with Player
          if (this.player && this.checkCollision(enemy, this.player)) {
              if (!config.isGodMode) {
                  const gameState = useGameStore.getState();
                  const newHp = gameState.hp - 0.5 * delta; // Damage over time
                  if (newHp <= 0) {
                      gameState.setStats({ hp: 0 });
                      gameState.setGameOver(true);
                  } else {
                      gameState.setStats({ hp: newHp });
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
                      // Score Reward
                      let score = 10; // Default Chaser
                      if (enemy.type === EnemyType.RUSHER) score = 20;
                      if (enemy.type === EnemyType.TANK) score = 50;
                      useGameStore.getState().addScore(score);

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
