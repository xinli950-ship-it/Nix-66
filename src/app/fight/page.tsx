'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { characters } from '@/data/characters';

export default function FightPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const p1Id = searchParams.get('p1');
  const p2Id = searchParams.get('p2');
  
  const p1 = characters.find(c => c.id === p1Id) || characters[0];
  const p2 = characters.find(c => c.id === p2Id) || characters[1];
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [showVideoBtn, setShowVideoBtn] = useState(false);
  const [combo, setCombo] = useState(0);
  const [screenShake, setScreenShake] = useState(0);
  
  // Game state refs
  const gameRef = useRef({
    p1: { x: 100, y: 250, hp: 100, maxHp: 100, width: 60, height: 100, velocity: {x: 0, y: 0}, attacking: false, attackTimer: 0, block: false, combo: 0, wins: 0 },
    p2: { x: 500, y: 250, hp: 100, maxHp: 100, width: 60, height: 100, velocity: {x: 0, y: 0}, attacking: false, attackTimer: 0, block: false, combo: 0, wins: 0 },
    keys: {} as Record<string, boolean>,
    particles: [] as any[],
    gameOver: false,
    round: 1,
    hitEffects: [] as any[],
    frame: 0,
    bgScroll: 0,
  });

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const g = gameRef.current;
    if (g.gameOver) return;
    g.frame++;
    
    const W = 800, H = 450;
    canvas.width = W;
    canvas.height = H;
    
    // Screen shake
    let shakeX = 0, shakeY = 0;
    if (screenShake > 0) {
      shakeX = (Math.random() - 0.5) * screenShake;
      shakeY = (Math.random() - 0.5) * screenShake;
      setScreenShake(s => s - 1);
    }
    
    ctx.save();
    ctx.translate(shakeX, shakeY);
    
    // ===== AMAZING BACKGROUND =====
    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#ff6b35');
    sky.addColorStop(0.3, '#f7c948');
    sky.addColorStop(0.6, '#ff8c42');
    sky.addColorStop(1, '#2d1b69');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    
    // Sun
    const sunGrad = ctx.createRadialGradient(600, 80, 10, 600, 80, 80);
    sunGrad.addColorStop(0, '#fff7a0');
    sunGrad.addColorStop(0.5, '#ffcc00');
    sunGrad.addColorStop(1, 'rgba(255,200,0,0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(600, 80, 80, 0, Math.PI * 2);
    ctx.fill();
    
    // Distant mountains
    ctx.fillStyle = '#4a2c6e';
    ctx.beginPath();
    ctx.moveTo(0, 280);
    for (let x = 0; x <= W; x += 40) {
      ctx.lineTo(x, 280 - Math.sin(x * 0.02 + 1) * 40 - Math.sin(x * 0.05) * 20);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    
    // Closer mountains
    ctx.fillStyle = '#2d1b69';
    ctx.beginPath();
    ctx.moveTo(0, 320);
    for (let x = 0; x <= W; x += 30) {
      ctx.lineTo(x, 320 - Math.sin(x * 0.03 + 3) * 30 - Math.sin(x * 0.07 + 1) * 15);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    
    // Arena floor with gradient
    const floorGrad = ctx.createLinearGradient(0, 350, 0, H);
    floorGrad.addColorStop(0, '#8B4513');
    floorGrad.addColorStop(0.3, '#6B3410');
    floorGrad.addColorStop(1, '#3a1a08');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 340, W, H - 340);
    
    // Floor lines (perspective)
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const x = i * 70 + (g.frame * 0.5) % 70;
      ctx.beginPath();
      ctx.moveTo(x, 340);
      ctx.lineTo(x - 100, H);
      ctx.stroke();
    }
    
    // Stage border glow
    ctx.strokeStyle = 'rgba(255,200,0,0.3)';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 15;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.shadowBlur = 0;
    
    // Fighting area markers
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.setLineDash([10, 10]);
    ctx.strokeRect(50, 320, W - 100, 10);
    ctx.setLineDash([]);
    
    // Particles
    g.particles = g.particles.filter((p: any) => p.life > 0);
    g.particles.forEach((p: any) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.vy += 0.2;
      ctx.globalAlpha = p.life / 60;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    // Hit effects
    g.hitEffects = g.hitEffects.filter((h: any) => h.life > 0);
    g.hitEffects.forEach((h: any) => {
      h.life--;
      h.size += 2;
      ctx.globalAlpha = h.life / 15;
      ctx.strokeStyle = h.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.size, 0, Math.PI * 2);
      ctx.stroke();
      // Star burst
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + h.life * 0.1;
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(h.x + Math.cos(angle) * h.size, h.y + Math.sin(angle) * h.size, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
    
    // Draw fighters
    const fighters = [g.p1, g.p2];
    fighters.forEach((f, idx) => {
      const isP1 = idx === 0;
      const fighter = characters.find(c => c.id === (isP1 ? p1Id : p2Id)) || characters[idx];
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(f.x + 30, 340, 35, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Fighter body - colored based on character
      ctx.save();
      if (!isP1) {
        ctx.translate(f.x + f.width, f.y);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(f.x, f.y);
      }
      
      // Body
      const color = isP1 ? '#e74c3c' : '#3498db';
      ctx.fillStyle = color;
      ctx.shadowColor = isP1 ? 'rgba(231,76,60,0.5)' : 'rgba(52,152,219,0.5)';
      ctx.shadowBlur = 10;
      
      // Head
      ctx.beginPath();
      ctx.arc(30, 20, 18, 0, Math.PI * 2);
      ctx.fill();
      
      // Hair
      ctx.fillStyle = isP1 ? '#c0392b' : '#2980b9';
      ctx.beginPath();
      ctx.arc(30, 15, 18, Math.PI, 2 * Math.PI);
      ctx.fill();
      
      // Eyes
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(24, 18, 4, 0, Math.PI * 2);
      ctx.arc(36, 18, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(24, 18, 2, 0, Math.PI * 2);
      ctx.arc(36, 18, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Body
      ctx.shadowBlur = 0;
      ctx.fillStyle = isP1 ? '#e74c3c' : '#3498db';
      ctx.fillRect(15, 38, 30, 35);
      
      // Arms
      const armSwing = f.attacking ? Math.sin(f.attackTimer * 0.3) * 20 : 0;
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(0, 40, 15 + armSwing, 8);
      ctx.fillRect(45 - armSwing, 40, 15 + armSwing, 8);
      
      // Fist glow when attacking
      if (f.attacking) {
        ctx.shadowColor = '#ff0';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.arc(15 + armSwing, 44, 5 + Math.sin(f.attackTimer) * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Legs
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#2c3e50';
      const legOffset = f.attacking ? Math.sin(f.attackTimer * 0.2) * 10 : 0;
      ctx.fillRect(18, 73, 10, 25);
      ctx.fillRect(32 + legOffset, 73, 10, 25);
      
      ctx.restore();
      
      // Character name above fighter
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(f.x - 10, f.y - 35, 80, 20);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(fighter.name, f.x + 30, f.y - 20);
      
      // Health bar
      const barWidth = 120;
      const barHeight = 12;
      const barX = isP1 ? 20 : W - barWidth - 20;
      const barY = 15;
      
      // Background
      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Health
      const hpPercent = f.hp / f.maxHp;
      const hpColor = hpPercent > 0.5 ? '#2ecc71' : hpPercent > 0.25 ? '#f39c12' : '#e74c3c';
      ctx.fillStyle = hpColor;
      ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
      
      // Border
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
      
      // Name on health bar
      ctx.fillStyle = 'white';
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = isP1 ? 'left' : 'right';
      ctx.fillText(fighter.name, isP1 ? barX + 2 : barX + barWidth - 2, barY + 10);
      
      // HP number
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = isP1 ? 'right' : 'left';
      ctx.fillText(Math.ceil(f.hp), isP1 ? barX - 5 : barX + barWidth + 5, barY + 10);
    });
    
    // Round display
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(W/2 - 50, 40, 100, 25);
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`ROUND ${g.round}`, W/2, 58);
    
    // VS text
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('VS', W/2, 200);
    
    // Controls hint
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('P1: WASD + J/K/L  |  P2: Arrow keys + 1/2/3', W/2, H - 10);
    
    ctx.restore();
    
    // ===== GAME LOGIC =====
    const p1 = g.p1;
    const p2AI = g.p2;
    
    // P1 controls
    const k = g.keys;
    
    // P1 movement
    p1.velocity.x = 0;
    if (k['a'] || k['A']) p1.velocity.x = -3;
    if (k['d'] || k['D']) p1.velocity.x = 3;
    
    // P1 jump
    if ((k['w'] || k['W']) && p1.y >= 250) {
      p1.velocity.y = -8;
    }
    p1.velocity.y += 0.4;
    p1.x += p1.velocity.x;
    p1.y += p1.velocity.y;
    
    // P1 attack
    if (k['j'] || k['J']) {
      if (!p1.attacking) {
        p1.attacking = true;
        p1.attackTimer = 0;
      }
    }
    
    if ((k['k'] || k['K']) && !p1.attacking) {
      p1.attacking = true;
      p1.attackTimer = 5;
    }
    
    if ((k['l'] || k['L']) && !p1.attacking) {
      p1.attacking = true;
      p1.attackTimer = 10;
    }
    
    if (k['s'] || k['S']) p1.block = true;
    else p1.block = false;
    
    // P1 attack timer
    if (p1.attacking) {
      p1.attackTimer++;
      if (p1.attackTimer > 15) {
        p1.attacking = false;
        p1.attackTimer = 0;
      }
    }
    
    // AI logic for P2
    const dist = Math.abs(p1.x - p2AI.x);
    const p2 = g.p2;
    
    if (dist > 80) {
      // Approach
      if (p2AI.x < p1.x) p2AI.velocity.x = 2;
      else p2AI.velocity.x = -2;
    } else {
      // Attack
      p2AI.velocity.x = 0;
      if (!p2AI.attacking && Math.random() < 0.08) {
        p2AI.attacking = true;
        p2AI.attackTimer = 0;
      }
      // Random retreat
      if (Math.random() < 0.02) {
        p2AI.velocity.x = p2AI.x < p1.x ? -3 : 3;
      }
    }
    
    // AI attack timer
    if (p2AI.attacking) {
      p2AI.attackTimer++;
      if (p2AI.attackTimer > 15) {
        p2AI.attacking = false;
        p2AI.attackTimer = 0;
      }
    }
    
    // AI gravity
    p2AI.velocity.y += 0.4;
    p2AI.x += p2AI.velocity.x;
    p2AI.y += p2AI.velocity.y;
    
    // Ground collision
    [p1, p2AI].forEach(f => {
      if (f.y > 250) {
        f.y = 250;
        f.velocity.y = 0;
      }
    });
    
    // Boundaries
    [p1, p2AI].forEach(f => {
      if (f.x < 20) f.x = 20;
      if (f.x > W - 80) f.x = W - 80;
    });
    
    // Collision detection
    const p1Rect = { x: p1.x, y: p1.y, w: p1.width, h: p1.height };
    const p2Rect = { x: p2AI.x, y: p2AI.y, w: p2AI.width, h: p2AI.height };
    
    // Push apart
    if (p1Rect.x < p2Rect.x + p2Rect.w && p1Rect.x + p1Rect.w > p2Rect.x) {
      if (p1.x < p2AI.x) p1.x = p2AI.x - p1.width;
      else p2AI.x = p1.x + p1.width;
    }
    
    // P1 hits P2
    if (p1.attacking && p1.attackTimer === 5) {
      const hitX = p1.x + p1.width;
      if (hitX > p2AI.x && hitX < p2AI.x + p2AI.width && Math.abs(p1.y - p2AI.y) < 60) {
        let damage = 8;
        if (p1.attackTimer > 8) damage = 15;
        if (p1.attackTimer > 12) damage = 25;
        if (p2AI.block) damage = Math.floor(damage * 0.3);
        p2AI.hp -= damage;
        p2AI.velocity.x = p2AI.x > p1.x ? 5 : -5;
        setScreenShake(8);
        g.hitEffects.push({ x: p2AI.x + 30, y: p2AI.y + 30, life: 15, color: '#ff0', size: 5 });
        for (let i = 0; i < 8; i++) {
          g.particles.push({ x: p2AI.x + 30, y: p2AI.y + 30, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 30 + Math.random() * 20, color: ['#ff0','#f80','#ff4444'][Math.floor(Math.random()*3)], size: 3 + Math.random() * 4 });
        }
        if (p2AI.hp <= 0) {
          p2AI.hp = 0;
          g.gameOver = true;
          setWinner(p1.name);
          setShowVideoBtn(true);
        }
      }
    }
    
    // P2 (AI) hits P1
    if (p2AI.attacking && p2AI.attackTimer === 5) {
      const hitX = p2AI.x + p2AI.width;
      const hitFromRight = p2AI.x > p1.x;
      const hitP1X = hitFromRight ? p2AI.x : p2AI.x + p2AI.width;
      if (Math.abs(hitP1X - p1.x - p1.width/2) < 40 && Math.abs(p2AI.y - p1.y) < 60) {
        let damage = 8;
        if (p2AI.attackTimer > 8) damage = 15;
        if (p2AI.attackTimer > 12) damage = 25;
        if (p1.block) damage = Math.floor(damage * 0.3);
        p1.hp -= damage;
        p1.velocity.x = p1.x > p2AI.x ? 5 : -5;
        setScreenShake(8);
        g.hitEffects.push({ x: p1.x + 30, y: p1.y + 30, life: 15, color: '#0ff', size: 5 });
        for (let i = 0; i < 8; i++) {
          g.particles.push({ x: p1.x + 30, y: p1.y + 30, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 30 + Math.random() * 20, color: ['#0ff','#08f','#4444ff'][Math.floor(Math.random()*3)], size: 3 + Math.random() * 4 });
        }
        if (p1.hp <= 0) {
          p1.hp = 0;
          g.gameOver = true;
          setWinner(p2.name);
          setShowVideoBtn(true);
        }
      }
    }
    
    requestAnimationFrame(gameLoop);
  }, [p1, p2, screenShake]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      gameRef.current.keys[e.key] = true;
      e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      gameRef.current.keys[e.key] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    gameLoop();
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameLoop]);
  
  const generateVideo = async () => {
    if (p1Id && p2Id) {
      const res = await fetch('/api/match/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player1Id: p1Id, player2Id: p2Id }),
      });
      const data = await res.json();
      if (data.matchId) {
        router.push(`/match/${data.matchId}`);
      }
    }
  };
  
  const rematch = () => {
    gameRef.current.p1.hp = 100;
    gameRef.current.p2.hp = 100;
    gameRef.current.p1.x = 100;
    gameRef.current.p2.x = 500;
    gameRef.current.p1.y = 250;
    gameRef.current.p2.y = 250;
    gameRef.current.gameOver = false;
    gameRef.current.round++;
    setWinner(null);
    setShowVideoBtn(false);
  };
  
  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="relative">
        <canvas ref={canvasRef} className="rounded-2xl shadow-[0_0_50px_rgba(255,200,0,0.3)] border-2 border-yellow-500/30" style={{ width: '100%', maxWidth: '900px', height: 'auto', aspectRatio: '800/450' }} />
        
        {winner && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-4xl font-black text-yellow-500 mb-2">{winner} WINS!</h2>
            <p className="text-gray-400 mb-6">What a battle!</p>
            <div className="flex gap-4">
              <button onClick={rematch} className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-all">
                🔄 REMATCH
              </button>
              {showVideoBtn && (
                <button onClick={generateVideo} className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition-all animate-pulse">
                  🎬 GENERATE AI REPLAY
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}