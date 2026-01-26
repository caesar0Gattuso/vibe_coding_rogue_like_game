import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../../game/core/GameEngine';
import { useConfigStore } from '../../store/configStore';

interface VirtualJoystickProps {
  onJoystickMove?: (x: number, y: number) => void;
  onJoystickEnd?: () => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Touch start position
  const [current, setCurrent] = useState({ x: 0, y: 0 });   // Current finger position

  // Configuration
  const MAX_RADIUS = 50; // Max drag distance in pixels

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Handle touches anywhere on the screen
      const touch = e.touches[0];
      
      // Prevent multi-touch from resetting the joystick if already active
      if (active) return;

      e.preventDefault(); // Prevent scrolling
      
      const { clientX, clientY } = touch;
      setActive(true);
      setPosition({ x: clientX, y: clientY });
      setCurrent({ x: clientX, y: clientY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!active) return;
      e.preventDefault();

      const touch = e.touches[0];
      const { clientX, clientY } = touch;

      // Calculate vector from start to current
      let dx = clientX - position.x;
      let dy = clientY - position.y;

      // Cap the distance
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > MAX_RADIUS) {
        const angle = Math.atan2(dy, dx);
        dx = Math.cos(angle) * MAX_RADIUS;
        dy = Math.sin(angle) * MAX_RADIUS;
      }

      setCurrent({ x: position.x + dx, y: position.y + dy });

      // Normalize output -1 to 1
      const normalizedX = dx / MAX_RADIUS;
      const normalizedY = dy / MAX_RADIUS;

      // Update Game Instance directly
      GameEngine.getInstance().setJoystickInput(normalizedX, normalizedY);
      
      const { tutorial, completeTutorialStep } = useConfigStore.getState();
      if (!tutorial.hasMoved && (Math.abs(normalizedX) > 0.1 || Math.abs(normalizedY) > 0.1)) {
          completeTutorialStep('hasMoved');
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!active) return;
      e.preventDefault();
      
      setActive(false);
      GameEngine.getInstance().setJoystickInput(0, 0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [active, position]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-10 select-none touch-none"
      style={{ pointerEvents: 'auto' }} // Allows touches but lets clicks pass through if handled carefully, or we just overlay purely for touches
    >
      {active && (
        <div 
          className="absolute w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: position.x, top: position.y }}
        >
          {/* Knob */}
          <div 
            className="absolute w-10 h-10 rounded-full bg-white/80 shadow-lg -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
            style={{ 
              left: '50%', 
              top: '50%',
              transform: `translate(calc(-50% + ${current.x - position.x}px), calc(-50% + ${current.y - position.y}px))`
            }}
          />
        </div>
      )}
    </div>
  );
};
