# 技能：游戏平衡与数值调整

要调整难度、速度、伤害和进度，通常涉及两个文件：用于常量的 `configStore.ts` 和用于动态缩放的 `GameEngine.ts`。

## 1. 全局常量 (简单调整)
打开 `src/store/configStore.ts`。`DEFAULT_CONFIG` 对象包含基准属性。

```typescript
const DEFAULT_CONFIG: GameConfig = {
  playerSpeed: 3,          // 基础移动速度
  playerHealth: 100,       // 最大生命值
  enemySpawnRate: 2,       // 基础生成间隔（秒）
  enemySpeed: 1,           // 基础敌人速度
  bulletDamage: 25,        // 基础武器伤害
  damagePerLevel: 0.05,    // 每级 +5% 伤害
  speedPerLevel: 0.02,     // 每级 +2% 速度
  magnetRadius: 100,       // 经验拾取范围
  // ...
};
```

**重要提示**: 由于配置会持久化在 `localStorage` 中，修改 `DEFAULT_CONFIG` 不会立即影响你本地已访问过的页面。你必须在控制台或 GM 工具中运行 `useConfigStore.getState().resetConfig()`，或者清除应用存储。

## 2. 动态缩放 (波次逻辑)
打开 `src/game/core/GameEngine.ts` 以调整难度随时间的增长方式。

**生成速率逻辑 (`update` 循环):**
```typescript
// 将生成速率限制在最快 0.2s
const spawnRate = Math.max(0.2, config.enemySpawnRate - ((currentWave - 1) * 0.1));
```
*修改 `0.1` 以改变生成加速的快慢。*

**敌人属性 (`spawnEnemy` 方法):**
```typescript
enemy.maxHp = enemy.maxHp * (1 + (wave - 1) * 0.2); // 每波 +20% HP
enemy.speed = enemy.speed * (1 + (wave - 1) * 0.05); // 每波 +5% 速度
```

**波次构成 (`spawnEnemy` 方法):**
你可以在这里调整高波次中出现不同敌人类型的概率：
```typescript
if (wave >= 5) {
    // 60% 追逐者, 20% 突击者, 20% 坦克
    if (rand < 0.6) type = EnemyType.CHASER;
    // ...
}
```

## 3. 武器平衡
每种武器在其类文件中都有自己的属性（例如 `src/game/weapons/MagicWand.ts`）。

```typescript
super(game, 'magic_wand', 'Magic Wand', {
  damage: 15,
  cooldown: 1.0, 
  range: 400,
  // ...
});
```

调整 `upgrade()` 方法以改变武器随等级升级的方式。
