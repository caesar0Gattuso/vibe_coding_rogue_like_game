// import React from 'react';
import { useState } from 'react';
import { Layout } from './components/ui/Layout';
import { GMConsole } from './components/gm/GMConsole';
import { GameCanvas } from './components/game/GameCanvas';
import { HUD } from './components/game/HUD';
import { LevelUpModal } from './components/game/LevelUpModal';
import { GameOverModal } from './components/game/GameOverModal';
import { VirtualJoystick } from './components/game/VirtualJoystick';
import { TutorialOverlay } from './components/game/TutorialOverlay';
import { WaveAnnouncement } from './components/game/WaveAnnouncement';
import { MainMenu } from './components/ui/MainMenu';
import { GameEngine } from './game/core/GameEngine';

function App() {
  const [inMenu, setInMenu] = useState(true);

  const handleStart = () => {
    setInMenu(false);
  };

  const handleReturnToMenu = () => {
    // Cleanup game instance when returning to menu
    const game = GameEngine.getInstance();
    game.destroy(); 
    setInMenu(true);
  };

  return (
    <Layout>
      {inMenu ? (
        <MainMenu onStart={handleStart} />
      ) : (
        <>
          <GameCanvas />
          <VirtualJoystick />
          <TutorialOverlay />
          <WaveAnnouncement />
          <HUD />
          <LevelUpModal />
          <GameOverModal onReturnToMenu={handleReturnToMenu} />
          <GMConsole />
        </>
      )}
    </Layout>
  );
}

export default App;
