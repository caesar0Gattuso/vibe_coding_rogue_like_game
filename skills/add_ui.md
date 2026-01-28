# 技能：添加 UI 组件

要添加新的 UI 元素（如小地图、技能栏或通知），请遵循以下步骤。

## 1. 创建 React 组件
在 `src/components/game/`（或 `src/components/ui` 用于通用组件）中创建一个新文件。

```tsx
// src/components/game/MyNewWidget.tsx
import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const MyNewWidget: React.FC = () => {
  // 1. 仅选择你需要的状态（防止不必要的重渲染）
  const score = useGameStore((state) => state.score);
  const level = useGameStore((state) => state.level);

  return (
    <div className="absolute top-4 right-4 bg-black/50 p-4 rounded text-white pointer-events-none">
      <h3 className="text-xl font-bold">统计</h3>
      <p>分数: {score}</p>
      <p>等级: {level}</p>
    </div>
  );
};
```

## 2. 挂载组件
通常有两个地方可以挂载游戏 UI：

**A. 在 HUD (抬头显示) 中**
如果它是核心玩法层的一部分。
编辑 `src/components/game/hud/HUD_V2.tsx`（或当前激活的版本）：

```tsx
// src/components/game/hud/HUD_V2.tsx
export const HUD_V2 = () => {
  return (
    <div className="relative w-full h-full pointer-events-none">
      {/* ... 现有的 UI ... */}
      <MyNewWidget />
    </div>
  );
};
```

**B. 在主布局 (Main Layout) 中**
如果它是全局覆盖层（如暂停菜单、设置）。
编辑 `src/components/ui/Layout.tsx`:

```tsx
// src/components/ui/Layout.tsx
export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-screen h-screen overflow-hidden bg-zinc-900">
      {children}
      <MyNewWidget /> {/* 将覆盖所有内容 */}
    </div>
  );
};
```

## 3. 最佳实践
- **指针事件 (Pointer Events)**: 大多数游戏 UI 容器应设置为 `pointer-events-none`，以便点击事件能穿透到游戏画布；仅在交互式按钮上设置 `pointer-events-auto`。
- **Zustand 选择器**: 始终使用 `state => state.property` 来仅订阅你关心的变化。
- **Tailwind**: 使用 `absolute` 定位将元素放置在画布之上。
