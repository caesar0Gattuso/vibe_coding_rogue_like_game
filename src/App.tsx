// import React from 'react';
import { Layout } from './components/ui/Layout';
import { GMConsole } from './components/gm/GMConsole';
import { GameCanvas } from './components/game/GameCanvas';
import { HUD } from './components/game/HUD';
import { LevelUpModal } from './components/game/LevelUpModal';
import { GameOverModal } from './components/game/GameOverModal';
import { VirtualJoystick } from './components/game/VirtualJoystick';

function App() {
  return (
    <Layout>
      <GameCanvas />
      <VirtualJoystick />
      <HUD />
      <LevelUpModal />
      <GameOverModal />
      <GMConsole />
    </Layout>
  );
}

export default App;
