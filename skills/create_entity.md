# 技能：创建新游戏实体

要向游戏中添加新实体（如新的敌人类型、投射物或拾取物），请遵循以下步骤。

## 1. 创建类
在 `src/game/entities/` 中创建一个新文件，继承基础 `Entity` 类（如果是更具体的类型，可继承 `Enemy` 或 `Bullet`）。

```typescript
// src/game/entities/MyNewEntity.ts
import { Entity } from './Entity';
import { Graphics } from 'pixi.js';

export class MyNewEntity extends Entity {
  constructor(x: number, y: number) {
    super(x, y);
    
    // 1. 设置视觉效果
    const graphics = new Graphics();
    graphics.circle(0, 0, 15);
    graphics.fill(0x00ff00);
    this.addChild(graphics);
    
    // 2. 设置属性
    this.speed = 2;
    this.radius = 15;
  }

  update(delta: number) {
    // 3. 实现行为逻辑
    this.x += this.speed * delta;
    
    // 如果基类有逻辑，记得调用 super.update
    // super.update(delta);
  }
}
```

## 2. 在 GameEngine 中注册/生成
前往 `src/game/core/GameEngine.ts`。

1.  **导入类**:
    ```typescript
    import { MyNewEntity } from '../entities/MyNewEntity';
    ```

2.  **添加存储数组** (如果你需要追踪多个此类实体):
    ```typescript
    private myEntities: MyNewEntity[] = [];
    ```

3.  **实现生成逻辑**:
    ```typescript
    public spawnMyEntity(x: number, y: number) {
        const entity = new MyNewEntity(x, y);
        this.myEntities.push(entity);
        this.gameContainer.addChild(entity);
    }
    ```

4.  **更新循环**:
    在 `GameEngine.update()` 中添加更新调用：
    ```typescript
    this.myEntities.forEach(e => e.update(delta));
    ```

## 3. 最佳实践
- **清理**: 如果实体需要被移除，确保实现 `die()` 或清理方法，并在更新循环中将其从数组中移除（倒序遍历是移除元素的最佳方式）。
- **对象池**: 对于高频对象（如子弹），考虑实现对象池（Object Pool）而不是每次都使用 `new` 创建。
