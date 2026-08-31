'use client';
import { useEffect, useRef } from 'react';

export function catBodyColor(cat?: string): string {
  switch ((cat || '').toLowerCase()) {
    case 'anime': return '#f97316';
    case 'cartoon': return '#a21caf';
    case 'wwe': return '#dc2626';
    case 'aew': return '#059669';
    case 'toku': return '#0284c7';
    case 'video games': return '#d97706';
    default: return '#64748b';
  }
}

// Per-character signature: hair color, hair style, accessory, outfit accent
function signature(name: string) {
  const n = (name || '').toLowerCase();
  const sig = {
    hair: '#2b2430',
    hairStyle: 'spiky' as 'spiky' | 'short' | 'long' | 'bald' | 'mohawk' | 'curly',
    accessory: '' as string,
    accent: '',
  };
  const has = (...k: string[]) => k.some((x) => n.includes(x));

  // Goku / DB heroes — spiky black, orange gi
  if (has('goku')) { sig.hair = '#2b2430'; sig.hairStyle = 'spiky'; sig.accent = 'gi'; sig.accent = 'orange'; }
  else if (has('vegeta')) { sig.hair = '#1f2937'; sig.hairStyle = 'spiky'; sig.accent = 'blue'; }
  else if (has('gohan', 'trunks', 'goten')) { sig.hair = '#312e81'; sig.hairStyle = 'spiky'; }
  else if (has('naruto')) { sig.hair = '#facc15'; sig.hairStyle = 'spiky'; sig.accent = 'orange'; }
  else if (has('sasuke', 'itachi', 'madara', 'kakashi')) { sig.hair = '#1f2937'; sig.hairStyle = 'spiky'; sig.accent = 'blue'; }
  else if (has('luffy')) { sig.hair = '#1f2937'; sig.accent = 'red'; } // straw hat
  else if (has('zoro')) { sig.hair = '#059669'; sig.accent = 'green'; }
  else if (has('sanji')) { sig.hair = '#facc15'; sig.accent = 'black'; }
  else if (has('ichigo')) { sig.hair = '#ea580c'; sig.hairStyle = 'spiky'; sig.accent = 'black'; }
  else if (has('saitama')) { sig.hair = '#f5c9a0'; sig.hairStyle = 'bald'; sig.accent = 'red'; sig.accent = 'yellow'; }
  else if (has('eren', 'levi', 'mikasa')) { sig.hair = '#200e0e'; sig.accent = 'brown'; }
  else if (has('yuji', 'gojo', 'sukuna')) { sig.hair = '#fbbf24'; sig.hairStyle = 'spiky'; }
  else if (has('tanjiro')) { sig.hair = '#7c2d12'; sig.accent = 'checkered'; }
  else if (has('nezuko')) { sig.hair = '#7c2d12'; sig.hairStyle = 'long'; sig.accent = 'pink'; }
  else if (has('sailor')) { sig.hair = '#fde68a'; sig.hairStyle = 'long'; sig.accent = 'sailor'; }
  else if (has('superman', 'super')) { sig.hair = '#1f2937'; sig.accent = 'cape'; sig.accent = 'red'; }
  else if (has('batman', 'bat')) { sig.hair = '#111'; sig.hairStyle = 'short'; sig.accent = 'cape'; sig.accessory = 'ears'; }
  else if (has('wonder')) { sig.hair = '#1f2937'; sig.hairStyle = 'long'; sig.accent = 'tiara'; }
  else if (has('spider')) { sig.hair = '#111'; sig.hairStyle = 'short'; sig.accent = 'mask'; }
  else if (has('iron man', 'ironman', 'iron')) { sig.hair = '#111'; sig.hairStyle = 'short'; sig.accent = 'iron'; }
  else if (has('hulk')) { sig.hair = '#065f46'; sig.hairStyle = 'short'; sig.accent = 'hulk'; sig.hair = '#14532d'; }
  else if (has('mario', 'luigi')) { sig.hair = '#7c2d12'; sig.hairStyle = 'curly'; sig.accent = 'cap'; sig.hair = '#5b2410'; }
  else if (has('sonic')) { sig.hair = '#2563eb'; sig.hairStyle = 'spiky'; sig.accent = 'blue'; sig.hair = '#1d4ed8'; }
  else if (has('pikachu')) { sig.hair = '#facc15'; sig.hairStyle = 'short'; sig.accessory = 'ears'; sig.hair = '#eab308'; }
  else if (has('undertaker')) { sig.hair = '#0a0a0a'; sig.hairStyle = 'long'; sig.accent = 'black'; }
  else if (has('cena', 'john')) { sig.hair = '#e5e7eb'; sig.hairStyle = 'short'; }
  else if (has('rock', 'dwayne')) { sig.hair = '#111'; sig.hairStyle = 'bald'; }
  else if (has('hogan')) { sig.hair = '#eab308'; sig.hairStyle = 'long'; }
  else if (has('stone cold', 'austin')) { sig.hair = '#78350f'; sig.hairStyle = 'bald'; }
  else if (has('brock')) { sig.hair = '#111'; sig.hairStyle = 'short'; }
  else if (has('minions') === false && has('kratos')) { sig.hair = '#e5e7eb'; sig.hairStyle = 'bald'; sig.accent = 'red'; }
  else if (has('link', 'zelda')) { sig.hair = '#facc15'; sig.hairStyle = 'long'; sig.accent = 'elf'; }
  else if (has('kirby')) { sig.hair = '#f472b6'; sig.hairStyle = 'short'; sig.accessory = 'round'; }
  else if (has('peach')) { sig.hair = '#fbbf24'; sig.hairStyle = 'long'; sig.accent = 'crown'; }
  else if (has('thanos')) { sig.hair = '#7c3aed'; sig.hairStyle = 'bald'; sig.accent = 'gauntlet'; sig.hair = '#6d28d9'; }
  return sig;
}

export default function CharacterFig({
  cat,
  color,
  size = 96,
  name,
}: {
  cat?: string;
  color?: string;
  size?: number;
  name?: string;
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
    const base = color || catBodyColor(cat);
    const main = color || base;
    const skin = '#f5c9a0';
    const dark = '#2b2430';
    const sig = signature(name || '');
    const hairCol = sig.hair;

    ctx.clearRect(0, 0, s, s);

    // ── Legs (stance) ──
    ctx.fillStyle = dark;
    ctx.fillRect(cx - s * 0.20, s * 0.70, s * 0.14, s * 0.20);
    ctx.fillRect(cx + s * 0.07, s * 0.70, s * 0.14, s * 0.20);
    ctx.fillStyle = skin;
    ctx.fillRect(cx - s * 0.24, s * 0.88, s * 0.19, s * 0.07);
    ctx.fillRect(cx + s * 0.05, s * 0.88, s * 0.19, s * 0.07);

    // ── Cape (superheroes) ──
    if (sig.accent === 'cape') {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.14, s * 0.40);
      ctx.lineTo(cx - s * 0.30, s * 0.86);
      ctx.lineTo(cx - s * 0.10, s * 0.76);
      ctx.closePath();
      ctx.fill();
    }

    // ── Torso ──
    ctx.fillStyle = main;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.24, s * 0.40);
    ctx.lineTo(cx + s * 0.24, s * 0.40);
    ctx.lineTo(cx + s * 0.20, s * 0.70);
    ctx.lineTo(cx - s * 0.20, s * 0.70);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = dark;
    ctx.fillRect(cx - s * 0.20, s * 0.66, s * 0.40, s * 0.05);

    // ── Arms (guard) ──
    ctx.strokeStyle = skin;
    ctx.lineWidth = s * 0.075;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx + s * 0.16, s * 0.46); ctx.lineTo(cx + s * 0.30, s * 0.35); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - s * 0.16, s * 0.47); ctx.lineTo(cx - s * 0.27, s * 0.37); ctx.stroke();
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(cx + s * 0.30, s * 0.35, s * 0.045, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx - s * 0.27, s * 0.37, s * 0.045, 0, Math.PI * 2); ctx.fill();

    // ── Head ──
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(cx, s * 0.22, s * 0.155, 0, Math.PI * 2); ctx.fill();

    // ── Hair (style-aware) ──
    ctx.fillStyle = hairCol;
    if (sig.hairStyle === 'bald') {
      // bald: just a scalp line
      ctx.strokeStyle = '#d9a97a';
      ctx.lineWidth = s * 0.02;
      ctx.beginPath(); ctx.arc(cx, s * 0.20, s * 0.14, 0, Math.PI * 2); ctx.stroke();
    } else if (sig.hairStyle === 'long') {
      ctx.beginPath(); ctx.arc(cx, s * 0.19, s * 0.158, Math.PI, 0); ctx.fill();
      ctx.fillRect(cx - s * 0.15, s * 0.18, s * 0.05, s * 0.32);
      ctx.fillRect(cx + s * 0.10, s * 0.18, s * 0.05, s * 0.32);
    } else if (sig.hairStyle === 'mohawk') {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.02, s * 0.05);
      ctx.lineTo(cx + s * 0.03, s * 0.18);
      ctx.lineTo(cx - s * 0.10, s * 0.18);
      ctx.closePath(); ctx.fill();
    } else if (sig.hairStyle === 'curly') {
      ctx.beginPath(); ctx.arc(cx, s * 0.16, s * 0.155, Math.PI, 0); ctx.fill();
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.arc(cx + i * s * 0.09, s * 0.055, s * 0.05, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      // spiky / short default
      ctx.beginPath(); ctx.arc(cx, s * 0.19, s * 0.158, Math.PI, 0); ctx.fill();
      // spikes
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.15, s * 0.20);
      ctx.lineTo(cx - s * 0.12, s * 0.03);
      ctx.lineTo(cx - s * 0.05, s * 0.16);
      ctx.lineTo(cx, s * 0.02);
      ctx.lineTo(cx + s * 0.05, s * 0.16);
      ctx.lineTo(cx + s * 0.12, s * 0.04);
      ctx.lineTo(cx + s * 0.15, s * 0.20);
      ctx.closePath(); ctx.fill();
    }

    // ── Headgear (hats/caps/ears) ──
    if (sig.accessory === 'ears') {
      // cat/pika ears
      ctx.fillStyle = hairCol;
      ctx.beginPath(); ctx.moveTo(cx - s * 0.13, s * 0.10); ctx.lineTo(cx - s * 0.13, s * 0.0); ctx.lineTo(cx - s * 0.05, s * 0.06); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx + s * 0.13, s * 0.10); ctx.lineTo(cx + s * 0.13, s * 0.0); ctx.lineTo(cx + s * 0.05, s * 0.06); ctx.closePath(); ctx.fill();
    }
    if (sig.accent === 'strawhat') {
      ctx.fillStyle = '#b45309';
      ctx.beginPath(); ctx.arc(cx, s * 0.18, s * 0.19, Math.PI, 0); ctx.fill();
      ctx.fillRect(cx - s * 0.03, s * 0.02, s * 0.06, s * 0.16);
    }
    if (sig.accent === 'cap') {
      ctx.fillStyle = sig.hair;
      ctx.beginPath(); ctx.arc(cx, s * 0.20, s * 0.165, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(cx, s * 0.015, s * 0.05, 0, Math.PI * 2); ctx.fill();
    }
    if (sig.accent === 'tiara') {
      ctx.fillStyle = '#facc15';
      ctx.beginPath(); ctx.arc(cx, s * 0.10, s * 0.025, 0, Math.PI * 2); ctx.fill();
    }
    if (sig.accessory === 'round') { // kirby - round body
      ctx.fillStyle = main;
      ctx.beginPath(); ctx.arc(cx, s * 0.46, s * 0.30, 0, Math.PI * 2); ctx.fill();
    }

    // ── Eyes ──
    ctx.fillStyle = dark;
    ctx.fillRect(cx - s * 0.055, s * 0.225, s * 0.03, s * 0.05);
    ctx.fillRect(cx + s * 0.02, s * 0.225, s * 0.03, s * 0.05);

    // ── Mouth ──
    ctx.strokeStyle = '#a56945';
    ctx.lineWidth = s * 0.018;
    ctx.beginPath(); ctx.moveTo(cx - s * 0.035, s * 0.315); ctx.lineTo(cx + s * 0.035, s * 0.315); ctx.stroke();
  }, [cat, color, size, name]);

  return <canvas ref={ref} style={{ width: size, height: size, display: 'block' }} aria-hidden="true" />;
}
