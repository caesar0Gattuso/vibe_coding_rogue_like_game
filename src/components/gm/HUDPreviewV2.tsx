import React from 'react';
import { Sword, Zap, Plus, Trophy, Home } from 'lucide-react';

export const HUDPreviewV2: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">HUD 2.0 (Immersive Corner)</h3>
        <button onClick={onClose} className="text-xs text-blue-400 hover:text-blue-300">Close Preview</button>
      </div>
      
      {/* Simulation Container */}
      <div className="w-full aspect-video bg-gray-900 relative rounded-xl overflow-hidden border border-white/20 flex-shrink-0 select-none">
        
        {/* === TOP LEFT: Player Unit Frame === */}
        <div className="absolute top-4 left-4 flex gap-2 items-start max-w-[40%]">
             {/* Avatar/Level Circle */}
             <div className="flex-shrink-0 w-12 h-12 bg-black/40 rounded-full border border-white/20 backdrop-blur-md shadow-lg flex items-center justify-center relative">
                 {/* Class Icon Placeholder */}
                 <span className="text-xl">🧙‍♂️</span>
                 <div className="absolute -bottom-1 -right-1 bg-black/90 text-[10px] font-bold text-yellow-400 px-1.5 py-0.5 rounded-full border border-white/10">
                     Lv{level}
                 </div>
            </div>

            {/* Bars & Stats */}
            <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                {/* HP Bar */}
                <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/20 relative backdrop-blur-sm">
                    <div 
                        className="h-full bg-gradient-to-r from-red-600 to-red-500" 
                        style={{ width: `${hpPercent}%` }}
                    />
                </div>
                {/* EXP Bar */}
                <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10 relative backdrop-blur-sm -mt-0.5">
                     <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${expPercent}%` }}
                    />
                </div>
                
                {/* Stats Row */}
                <div className="flex gap-2 mt-0.5">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-white/80">
                        <Sword size={9} className="text-red-400" />
                        <span>{displayedDamage}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-white/80">
                        <Zap size={9} className="text-yellow-400" />
                        <span>{displayedSpeed}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* === TOP CENTER: Minimal Ticker === */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
             {/* Wave Pill */}
             <div className="bg-black/20 rounded-full px-3 py-1 backdrop-blur-sm border border-white/5 flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                 <span className="text-[10px] uppercase font-bold text-white/60">Wave</span>
                 <span className="text-xs font-bold text-white">{wave}</span>
             </div>
             
             {/* Score Pill */}
             <div className="bg-black/20 rounded-full px-3 py-1 backdrop-blur-sm border border-white/5 flex items-center gap-1.5">
                <Trophy size={10} className="text-yellow-400" />
                <span className="text-xs font-bold text-white font-mono">{score.toLocaleString()}</span>
            </div>
        </div>

        {/* === TOP RIGHT: System === */}
        <div className="absolute top-4 right-4">
             <div className="w-8 h-8 bg-black/20 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer">
                <Home size={14} />
            </div>
        </div>

        {/* === BOTTOM RIGHT: Weapon Grid (Arsenal) === */}
        <div className="absolute bottom-6 right-6 grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map(i => (
                 <div key={i} className="w-10 h-10 bg-black/40 border border-white/20 rounded-xl flex items-center justify-center relative backdrop-blur-sm shadow-lg group">
                    {i === 1 ? (
                        <div className="flex items-center justify-center w-full h-full text-white text-lg drop-shadow-md">🪄</div>
                    ) : (
                        <div className="text-white/5 group-hover:text-white/20 transition-colors"><Plus size={14} /></div>
                    )}
                     {i === 1 && (
                         <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[8px] px-1 rounded-sm font-bold shadow-sm">
                             3
                         </div>
                     )}
                </div>
            ))}
        </div>

        {/* === BOTTOM LEFT: Joystick Placeholder === */}
        <div className="absolute bottom-8 left-8 w-20 h-20 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
             <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md shadow-inner" />
        </div>

        {/* Dummy Player */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
        
      </div>
      <p className="text-xs text-white/40 mt-4 text-center">
        "Immersive Corner" Layout • Clears Central View
      </p>
    </div>
  );
};
