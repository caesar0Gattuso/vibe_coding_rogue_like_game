# 技能：添加新武器

要添加新武器（例如“火球术”、“斧头”），请遵循以下步骤。

## 1. 创建武器类
在 `src/game/weapons/` 中创建一个文件，继承 `Weapon` 抽象类。

```typescript
// src/game/weapons/Fireball.ts
import { Weapon } from './Weapon';
import { GameEngine } from '../core/GameEngine';
import { Bullet } from '../entities/Bullet'; // 或者自定义的 Projectile 类

export class Fireball extends Weapon {
  constructor(game: GameEngine) {
    super(game, 'fireball', 'Fireball', {
      damage: 20,
      cooldown: 1.5,
      range: 300,
      speed: 6,
      amount: 1, // 投射物数量
    });
    // 可选：设置图标
    // this.icon = Flame; // 来自 lucide-react
  }

  protected fire(): void {
    // 1. 获取玩家位置
    const player = this.game.getPlayer();
    if (!player) return;

    // 2. 确定目标（最近的敌人）
    const enemies = this.game.getEnemies();
    const nearest = this.findNearestEnemy(player, enemies);
    
    // 3. 创建投射物
    if (nearest) {
        // 计算方向向量
        const dx = nearest.x - player.x;
        const dy = nearest.y - player.y;
        
        const bullet = new Bullet(player.x, player.y, dx, dy, this.getDamage());
        bullet.speed = this.stats.speed;
        
        // 自定义视觉效果
        // bullet.tint = 0xff0000; 
        
        this.game.addBullet(bullet);
    }
  }

  public upgrade(): void {
    if (this.level >= this.maxLevel) return;
    this.level++;
    
    // 实现升级逻辑（增加伤害、减少冷却、增加数量等）
    this.stats.damage += 10;
    this.stats.cooldown *= 0.9;
  }
  
  // 辅助函数
  private findNearestEnemy(player: any, enemies: any[]) {
     // ... 简单的距离检查 ...
     return enemies[0]; // 简化示例
  }
}
```

## 2. 在 WeaponManager 中注册
(目前，你可能需要手动将其添加到初始装备或掉落池中)。

在 `src/game/core/GameEngine.ts` 或 `src/game/weapons/WeaponManager.ts` (如果存在):

```typescript
// GameEngine.ts -> startNewGame()
this.weaponManager.addWeapon(new Fireball(this));
```

## 3. 武器属性接口 (WeaponStats)
`WeaponStats` 接口支持：
- `damage`: 每次命中的基础伤害。
- `cooldown`: 射击间隔时间（秒）。
- `range`: 最大有效范围（常用于 AI 瞄准）。
- `speed`: 投射物速度。
- `amount`: 投射物数量（多重射击）。
- `area`: 大小倍率（用于范围伤害 AoE）。
