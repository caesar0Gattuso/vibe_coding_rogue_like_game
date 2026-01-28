# 项目架构与代码指南

## 项目概览
本项目是一个混合了 React + Pixi.js 的游戏引擎，专为小型、快速迭代的游戏设计。它具有独特的“双模式”系统，在同一个代码库中支持俯视视角（类似幸存者类游戏）和平台跳跃（Platformer）两种游戏风格。

## 技术栈
- **核心**: TypeScript, Vite
- **渲染**: Pixi.js v8
- **UI 框架**: React v19
- **状态管理**: Zustand (带持久化)
- **样式**: Tailwind CSS

## 代码结构

```text
src/
├── components/         # React UI 组件
│   ├── game/           # 游戏专用 UI (HUD, 模态框)
│   ├── gm/             # 调试/GM 控制台
│   └── ui/             # 通用 UI 套件 (按钮, 卡片)
├── game/               # 核心游戏逻辑 (Pixi.js 世界)
│   ├── core/           # 主引擎循环 (GameEngine.ts)
│   ├── effects/        # 视觉特效 (粒子, 震动)
│   ├── entities/       # 游戏对象 (玩家, 敌人, 子弹)
│   └── weapons/        # 武器系统
├── store/              # 状态管理
│   ├── gameStore.ts    # 主游戏状态 (分数, 血量, 模式)
│   └── configStore.ts  # 游戏配置与数值调整
└── main.tsx            # 入口点
```

## 架构

本项目采用了 **游戏循环** (Pixi.js) 与 **UI 层** (React) 严格分离的架构。

```mermaid
graph TD
    subgraph React UI
        UI[HUD & 菜单]
        Store[Zustand Store]
    end

    subgraph Game Loop [游戏循环]
        Engine[GameEngine (单例)]
        Loop[Ticker 循环]
        Entities[实体管理器]
        Physics[物理引擎]
    end

    Input[用户输入] -->|事件| Engine
    Input -->|React State| Store
    
    Engine -->|更新视觉| Loop
    Loop -->|Delta Time| Entities
    Loop -->|同步状态| Store
    
    Store -->|重新渲染| UI
    UI -->|Action 操作| Store
    Store -->|配置变更| Engine
```

### 核心系统

1.  **游戏引擎 (单例)**
    *   `GameEngine.ts` 是游戏的核心。它管理 Pixi Application 实例和主 `update()` 循环。
    *   它独立于 React 渲染运行，以确保流畅的 60fps 性能。

2.  **双模式物理**
    *   引擎检查 `useGameStore.getState().currentMode`。
    *   **Top-Down (俯视)**: 标准 X/Y 移动。
    *   **Platformer (平台)**: 应用重力和地面碰撞逻辑 (`applyPhysics`)。

3.  **状态同步**
    *   `GameEngine` 每帧读取 `configStore` 中的配置。
    *   `GameEngine` 将游戏玩法事件（分数、游戏结束）写入 `gameStore`。
    *   React 组件订阅 `gameStore` 以更新 HUD，无需轮询。
