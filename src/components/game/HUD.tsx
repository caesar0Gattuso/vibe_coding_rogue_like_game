import React from 'react';
import { useConfigStore } from '../../store/configStore';
import { HUD_V1 } from './hud/HUD_V1';
import { HUD_V2 } from './hud/HUD_V2';

export const HUD: React.FC = () => {
  const uiVersion = useConfigStore((state) => state.uiVersion);

  return uiVersion === 'v1' ? <HUD_V1 /> : <HUD_V2 />;
};
