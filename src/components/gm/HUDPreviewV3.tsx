import React from 'react';
import { Sword, Zap, Plus, Trophy, Home } from 'lucide-react';
import { formatScore } from '../../game/utils/formatUtils';

export const HUDPreviewV3: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">HUD 3.0 (Compact)</h3>
        <button onClick={onClose} className="text-xs text-blue-400 hover:text-blue-300">Close Preview</button>
      </div>
      
      {/* Simulation Container */}
      <div className="w-full aspect-video bg-gray-900 relative rounded-xl overflow-hidden border border-white/20 flex-shrink-0 select-none">
        
        {/* === TOP BAR === */}
        <div className="absolute inset-x-0 top-0 p-4 pt-4 pointer-events-none flex items-center justify-between z-10 gap-4">
          
          {/* LEFT: Level Only */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center bg-black/40 w-10 h-10 rounded-lg border border-white/20 backdrop-blur-md shadow-lg">
             <span className="text-[8px] text-white/60 uppercase font-bold">Lv</span>
             <span className="text-lg font-bold leading-none text-yellow-400">{level}</span>
          </div>

          {/* CENTER: HP/EXP (Expanded) */}
          <div className="flex-1 max-w-md flex flex-col items-center gap-1">
             {/* HP Bar */}
            <div className="w-full h-4 bg-black/60 rounded-full overflow-hidden border border-white/20 relative backdrop-blur-sm shadow-md">
                <div 
                    className="h-full bg-red-500" 
                    style={{ width: `${hpPercent}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white drop-shadow-md">
                    750 / 1000
                </div>
            </div>
            
            {/* EXP Bar */}
            <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10 relative backdrop-blur-sm">
                 <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${expPercent}%` }}
                />
                 <div className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-white/90 drop-shadow-md">
                    450 / 1200 XP
                </div>
            </div>
          </div>

          {/* RIGHT: Wave Only */}
          <div className="flex-shrink-0 relative w-10 h-10 bg-black/40 rounded-lg backdrop-blur-md shadow-lg border border-white/20 flex flex-col items-center justify-center overflow-hidden">
               <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <circle cx="20" cy="20" r="18" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="113.1" strokeDashoffset="40" strokeLinecap="round" />
               </svg>
               <span className="text-[6px] text-white/60 uppercase font-bold z-10">Wave</span>
               <span className="text-lg font-bold leading-none text-red-400 z-10">{wave}</span>
          </div>
        </div>


        {/* === SECONDARY ROW (Row 2) === */}
        <div className="absolute top-16 inset-x-0 px-4 flex justify-between items-start pointer-events-none">
            
            {/* LEFT: Stats (Compact Width) */}
            <div className="flex flex-col justify-between w-14 h-12 gap-1.5">
                <div className="flex items-center justify-center gap-1 bg-black/30 rounded-lg backdrop-blur-sm border border-white/5 h-full w-full">
                    <Sword size={10} className="text-red-400 flex-shrink-0" />
                    <span className="text-[9px] font-bold text-white/90">{displayedDamage}</span>
                </div>
                <div className="flex items-center justify-center gap-1 bg-black/30 rounded-lg backdrop-blur-sm border border-white/5 h-full w-full">
                    <Zap size={10} className="text-yellow-400 flex-shrink-0" />
                    <span className="text-[9px] font-bold text-white/90">{displayedSpeed}</span>
                </div>
            </div>

            {/* CENTER: Weapons (Further Scaled Down) */}
            <div className="absolute left-1/2 -translate-x-1/2 flex gap-1 h-12 items-center">
                 {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 bg-black/40 border border-white/20 rounded-md flex items-center justify-center relative backdrop-blur-sm shadow-sm">
                        {i === 1 ? (
                            <div className="flex items-center justify-center w-full h-full text-white"><span className="text-lg">🪄</span></div>
                        ) : (
                            <div className="text-white/10"><Plus size={12} /></div>
                        )}
                        {i === 1 && (
                            <div className="absolute -bottom-1 -right-1 bg-black/80 text-[6px] px-1 rounded border border-white/10 text-white font-bold scale-90">
                                Lv3
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* RIGHT: Score & Home (Compact Width - Symmetrical to Left) */}
            <div className="flex flex-col justify-between w-14 h-12 gap-1.5 items-end">
                 {/* Score */}
                 <div className="bg-black/60 rounded-lg border border-white/10 flex items-center justify-center gap-1 backdrop-blur-md h-full w-full">
                    <Trophy size={10} className="text-yellow-400 flex-shrink-0" />
                    <span className="text-[9px] font-bold text-white font-mono">{formatScore(score)}</span>
                </div>

                {/* Home Button */}
                 <div className="bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-md flex items-center justify-center text-white/80 h-full w-full">
                    <Home size={12} />
                </div>
            </div>
        </div>

        {/* Dummy Player & Joystick for context */}
        <div className="absolute bottom-12 left-12 w-16 h-16 rounded-full border border-white/10 opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
        
      </div>
      <p className="text-xs text-white/40 mt-4 text-center">
        Compact Sidebars (w-14) • Weapons (w-8) • Score (12k+)
      </p>
    </div>
  );
};
