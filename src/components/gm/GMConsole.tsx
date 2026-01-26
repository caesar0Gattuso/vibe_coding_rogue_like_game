import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Save, RefreshCw, Zap } from 'lucide-react';
import { useConfigStore } from '../../store/configStore';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

export const GMConsole: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const config = useConfigStore();

  const handleExport = () => {
    const json = config.exportConfig();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <motion.button
        className="fixed bottom-8 right-8 z-50 p-3 bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/20 text-white"
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
      >
        <Settings size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) setIsOpen(false);
            }}
          >
            <GlassCard 
              className="w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col" 
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Zap className="text-yellow-400" size={20} />
                  <h2 className="text-lg font-bold">GM Console</h2>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Player Stats */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Player</h3>
                  <ConfigItem 
                    label="Speed" 
                    value={config.playerSpeed} 
                    onChange={(v) => config.updateConfig('playerSpeed', v)}
                    min={1} max={10} step={0.5}
                  />
                  <ConfigItem 
                    label="Max Health" 
                    value={config.playerHealth} 
                    onChange={(v) => config.updateConfig('playerHealth', v)}
                    min={10} max={1000} step={10}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">God Mode</span>
                    <input 
                      type="checkbox" 
                      checked={config.isGodMode}
                      onChange={(e) => config.updateConfig('isGodMode', e.target.checked)}
                      className="w-5 h-5 accent-blue-500"
                    />
                  </div>
                </div>

                {/* Combat */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Combat</h3>
                  <ConfigItem 
                    label="Bullet Dmg" 
                    value={config.bulletDamage} 
                    onChange={(v) => config.updateConfig('bulletDamage', v)}
                    min={1} max={100} step={1}
                  />
                  <ConfigItem 
                    label="Bullet Speed" 
                    value={config.bulletSpeed} 
                    onChange={(v) => config.updateConfig('bulletSpeed', v)}
                    min={1} max={20} step={1}
                  />
                </div>

                {/* Enemies */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Enemies</h3>
                  <ConfigItem 
                    label="Spawn Rate (s)" 
                    value={config.enemySpawnRate} 
                    onChange={(v) => config.updateConfig('enemySpawnRate', v)}
                    min={0.1} max={5} step={0.1}
                  />
                  <ConfigItem 
                    label="Move Speed" 
                    value={config.enemySpeed} 
                    onChange={(v) => config.updateConfig('enemySpeed', v)}
                    min={0.1} max={5} step={0.1}
                  />
                </div>
                 {/* Game Speed */}
                 <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">System</h3>
                  <ConfigItem 
                    label="Game Speed" 
                    value={config.gameSpeed} 
                    onChange={(v) => config.updateConfig('gameSpeed', v)}
                    min={0} max={3} step={0.1}
                  />
                </div>
              </div>

              <div className="p-4 border-t border-white/10 flex gap-2">
                <Button variant="secondary" size="sm" onClick={config.resetConfig} className="flex-1">
                  <RefreshCw size={16} /> Reset
                </Button>
                <Button variant="primary" size="sm" onClick={handleExport} className="flex-1">
                  <Save size={16} /> Export JSON
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

interface ConfigItemProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step: number;
}

const ConfigItem: React.FC<ConfigItemProps> = ({ label, value, onChange, min, max, step }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span className="font-mono text-white/70">{value}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step} 
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
    />
  </div>
);
