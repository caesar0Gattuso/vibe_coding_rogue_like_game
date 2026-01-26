// import React from 'react';
import { Layout } from './components/ui/Layout';
import { GMConsole } from './components/gm/GMConsole';
import { GameCanvas } from './components/game/GameCanvas';
import { HUD } from './components/game/HUD';
import { LevelUpModal } from './components/game/LevelUpModal';
import { GameOverModal } from './components/game/GameOverModal';
import { VirtualJoystick } from './components/game/VirtualJoystick';
import { TutorialOverlay } from './components/game/TutorialOverlay';
import { WaveAnnouncement } from './components/game/WaveAnnouncement';

function App() {
  return (
    <Layout>
      <GameCanvas />
      <VirtualJoystick />
      <TutorialOverlay />
      <WaveAnnouncement />
      <HUD />
      <LevelUpModal />
      <GameOverModal />
      <GMConsole />
    </Layout>
  );
}

export default App;
