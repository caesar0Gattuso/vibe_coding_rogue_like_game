import React from 'react';
import { Sword, Zap, Plus, Trophy, Home } from 'lucide-react';

export const HUDPreview: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // Dummy Data for Preview
  const hpPercent = 75;
  const expPercent = 40;
  const level = 12;
  const score = 12450;
  const wave = 4;
  const displayedDamage = 150;
  const displayedSpeed = "2.0";

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">HUD 2.0 Preview</h3>
        <button onClick={onClose} className="text-xs text-blue-400 hover:text-blue-300">Close Preview</button>
      </div>
      
      {/* Simulation Container - Aspect Ratio Video to simulate landscape phone */}
      <div className="w-full aspect-video bg-gray-900 relative rounded-xl overflow-hidden border border-white/20 flex-shrink-0 select-none">
        
        {/* === TOP BAR (New Layout) === */}
        <div className="absolute inset-x-0 top-0 p-4 pt-4 pointer-events-none flex items-start justify-between">
          
          {/* LEFT: Level & Stats */}
          <div className="flex flex-col gap-2 items-start">
             {/* Level Badge */}
             <div className="flex flex-col items-center justify-center bg-black/40 w-10 h-10 rounded-lg border border-white/20 backdrop-blur-md shadow-lg">
                <span className="text-[8px] text-white/60 uppercase font-bold">Lv</span>
                <span className="text-lg font-bold leading-none text-yellow-400">{level}</span>
            </div>
            
            {/* Stats (Moved here) */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-lg backdrop-blur-sm border border-white/5 text-[10px] font-bold text-white/90">
                    <Sword size={10} className="text-red-400" />
                    <span>{displayedDamage}</span>
                </div>
                <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-lg backdrop-blur-sm border border-white/5 text-[10px] font-bold text-white/90">
                    <Zap size={10} className="text-yellow-400" />
                    <span>{displayedSpeed}</span>
                </div>
            </div>
          </div>

          {/* CENTER: HP/EXP & Score */}
          <div className="absolute left-1/2 -translate-x-1/2 top-4 flex flex-col items-center gap-1 w-1/3 max-w-[200px]">
             {/* HP Bar */}
            <div className="w-full h-4 bg-black/60 rounded-full overflow-hidden border border-white/20 relative backdrop-blur-sm">
                <div 
                    className="h-full bg-red-500" 
                    style={{ width: `${hpPercent}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white drop-shadow-md">
                    750 / 1000
                </div>
            </div>
            
            {/* EXP Bar */}
            <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10 relative backdrop-blur-sm">
                 <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${expPercent}%` }}
                />
            </div>

            {/* Score (Moved under bars) */}
             <div className="bg-black/40 rounded-full border border-white/5 px-2 py-0.5 flex items-center gap-1 backdrop-blur-md mt-1 scale-90">
                <Trophy size={10} className="text-yellow-400" />
                <span className="text-xs font-bold text-white font-mono">{score.toLocaleString()}</span>
            </div>
          </div>

          {/* RIGHT: Wave & Home */}
          <div className="flex items-start gap-2">
            {/* Wave Badge */}
            <div className="relative w-10 h-10 bg-black/40 rounded-lg backdrop-blur-md shadow-lg border border-white/20 flex flex-col items-center justify-center overflow-hidden">
                 <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                    <circle cx="20" cy="20" r="18" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="113.1" strokeDashoffset="40" strokeLinecap="round" />
                 </svg>
                 <span className="text-[6px] text-white/60 uppercase font-bold z-10">Wave</span>
                 <span className="text-lg font-bold leading-none text-red-400 z-10">{wave}</span>
            </div>

            {/* Home Button (Moved here) */}
             <div className="w-8 h-8 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-md flex items-center justify-center text-white/80">
                <Home size={14} />
            </div>
          </div>

        </div>

        {/* === SECONDARY CENTER: Weapons === */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
            {[1, 2, 3, 4].map(i => (
                 <div key={i} className="w-8 h-8 bg-black/40 border border-white/20 rounded-md flex items-center justify-center relative backdrop-blur-sm">
                    {i === 1 ? (
                        <div className="flex items-center justify-center w-full h-full text-white"><span className="text-lg">🪄</span></div>
                    ) : (
                        <div className="text-white/10"><Plus size={12} /></div>
                    )}
                     {i === 1 && (
                         <div className="absolute -bottom-1 -right-1 bg-black/80 text-[8px] px-1 rounded border border-white/10 text-white font-bold scale-90">
                             Lv3
                         </div>
                     )}
                </div>
            ))}
        </div>

        {/* Dummy Player & Joystick for context */}
        <div className="absolute bottom-12 left-12 w-16 h-16 rounded-full border border-white/10 opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
        
      </div>
      <p className="text-xs text-white/40 mt-4 text-center">
        Static Preview • Not Interactive
      </p>
    </div>
  );
};
