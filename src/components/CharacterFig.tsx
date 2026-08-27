'use client';
import { useEffect, useRef } from 'react';

/** Category → primary body color for the drawn character figure */
export function catBodyColor(cat?: string): string {
  switch ((cat || '').toLowerCase()) {
    case 'anime': return '#f97316';   // orange
    case 'cartoon': return '#c026d3'; // fuchsia
    case 'wwe': return '#dc2626';     // red
    case 'aew': return '#059669';     // emerald
    case 'toku': return '#0284c7';    // sky
    case 'video games': return '#d97706'; // amber
    default: return '#64748b';        // slate
  }
}

/**
 * Draws a clean fighting-game character figure (head, hair, torso, arms,
 * legs in a fight stance) onto a canvas — no images, just code-drawn characters.
 */
export default function CharacterFig({
  cat,
  color,
  size = 96,
}: {
  cat?: string;
  color?: string;
  size?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const px = size * dpr;
    cv.width = px;
    cv.height = px;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const s = size;
    const cx = s / 2;
    const main = color || catBodyColor(cat);
    const skin = '#f5c9a0';
    const dark = '#2b2430';

    ctx.clearRect(0, 0, s, s);

    // Legs (dark) — fighting stance
    ctx.fillStyle = dark;
    ctx.fillRect(cx - s * 0.20, s * 0.68, s * 0.13, s * 0.22);
    ctx.fillRect(cx + s * 0.07, s * 0.68, s * 0.13, s * 0.22);
    // Feet (skin/white)
    ctx.fillStyle = skin;
    ctx.fillRect(cx - s * 0.23, s * 0.87, s * 0.17, s * 0.07);
    ctx.fillRect(cx + s * 0.06, s * 0.87, s * 0.17, s * 0.07);

    // Torso (category color), slightly trapezoid
    ctx.fillStyle = main;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.235, s * 0.40);
    ctx.lineTo(cx + s * 0.235, s * 0.40);
    ctx.lineTo(cx + s * 0.19, s * 0.68);
    ctx.lineTo(cx - s * 0.19, s * 0.68);
    ctx.closePath();
    ctx.fill();
    // Belt
    ctx.fillStyle = dark;
    ctx.fillRect(cx - s * 0.19, s * 0.64, s * 0.38, s * 0.045);

    // Arms (skin) — fighter guard stance
    ctx.strokeStyle = skin;
    ctx.lineWidth = s * 0.075;
    ctx.lineCap = 'round';
    // front arm raised (guard)
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.16, s * 0.45);
    ctx.lineTo(cx + s * 0.30, s * 0.34);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.16, s * 0.46);
    ctx.lineTo(cx - s * 0.27, s * 0.36);
    ctx.stroke();
    // fists
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(cx + s * 0.30, s * 0.34, s * 0.045, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx - s * 0.27, s * 0.36, s * 0.045, 0, Math.PI * 2); ctx.fill();

    // Head
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(cx, s * 0.21, s * 0.155, 0, Math.PI * 2);
    ctx.fill();

    // Hair (main color) — top cap
    ctx.fillStyle = main;
    ctx.beginPath();
    ctx.arc(cx, s * 0.19, s * 0.155, Math.PI, 0);
    ctx.fill();

    // Eyes
    ctx.fillStyle = dark;
    ctx.fillRect(cx - s * 0.05, s * 0.215, s * 0.03, s * 0.05);
    ctx.fillRect(cx + s * 0.02, s * 0.215, s * 0.03, s * 0.05);

    // Mouth
    ctx.strokeStyle = '#a56945';
    ctx.lineWidth = s * 0.018;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.035, s * 0.30);
    ctx.lineTo(cx + s * 0.035, s * 0.30);
    ctx.stroke();
  }, [cat, color, size]);

  return (
    <canvas
      ref={ref}
      style={{ width: size, height: size, display: 'block' }}
      aria-hidden="true"
    />
  );
}
