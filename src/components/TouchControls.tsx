'use client';
import { useEffect, useState } from 'react';

interface TouchControlsProps {
  keysRef: { current: Set<string> };
}

/**
 * On-screen control pad for touch devices (phones/tablets).
 * Writes directly into the same keysRef the keyboard handler uses,
 * so the game logic is unchanged. Renders nothing on desktop.
 */
export default function TouchControls({ keysRef }: TouchControlsProps) {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouch(window.matchMedia('(pointer: coarse)').matches);
    }
  }, []);

  if (!isTouch) return null;

  const bind = (key: string) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      keysRef.current.add(key);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      keysRef.current.delete(key);
    },
    onPointerLeave: (e: React.PointerEvent) => {
      e.preventDefault();
      keysRef.current.delete(key);
    },
    onPointerCancel: () => {
      keysRef.current.delete(key);
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  const btn =
    'select-none touch-none flex items-center justify-center rounded-xl bg-white/15 border border-white/30 text-white font-black active:bg-yellow-500 active:text-black transition-colors shadow-lg';

  return (
    <div
      className="fixed bottom-3 left-0 right-0 z-50 flex items-end justify-between gap-2 px-4 pb-2 select-none"
      style={{ touchAction: 'none' }}
    >
      {/* Movement */}
      <div className="flex gap-2">
        <button {...bind('a')} className={`${btn} w-16 h-16 text-2xl`} aria-label="Move left">
          ◀
        </button>
        <button {...bind('d')} className={`${btn} w-16 h-16 text-2xl`} aria-label="Move right">
          ▶
        </button>
      </div>
      {/* Actions */}
      <div className="flex flex-wrap justify-end gap-2 max-w-[270px]">
        <button {...bind('j')} className={`${btn} w-14 h-14 text-xs`}>
          PUNCH
        </button>
        <button {...bind('k')} className={`${btn} w-14 h-14 text-xs`}>
          KICK
        </button>
        <button {...bind('l')} className={`${btn} w-14 h-14 text-xs`}>
          JUMP
        </button>
        <button {...bind('p')} className={`${btn} w-14 h-14 text-xs`}>
          BLOCK
        </button>
        <button {...bind('e')} className={`${btn} w-14 h-14 text-xs`}>
          💋 KISS
        </button>
        <button {...bind('enter')} className={`${btn} w-14 h-14 text-xs`}>
          CHARGE
        </button>
      </div>
    </div>
  );
}
