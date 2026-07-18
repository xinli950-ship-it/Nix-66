'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { characters, Character } from '@/data/characters';

const CATEGORIES = ['All', 'Anime', 'Cartoon', 'WWE', 'AEW', 'Toku'] as const;

// ─── Game Types ────────────────────────────────────────────────

interface FighterState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  width: number;
  height: number;
  facing: 1 | -1;
  isAttacking: boolean;
  attackType: 'punch' | 'kick' | 'special' | 'blast' | 'slam' | 'ultimate' | null;
  attackTimer: number;
  hitTimer: number;
  combo: number;
  canAct: boolean;
  isBlocking: boolean;
  specialCooldown: number;
  blastCooldown: number;
  slamCooldown: number;
  comboMeter: number;
  maxComboMeter: number;
  isCharging: boolean;
        chargeAmount: number;
        chargedAttack: boolean;
        name: string;
  color: string;
  imageUrl: string;
  scale: number;
}

type GamePhase = 'select' | 'vs' | 'fight' | 'ko' | 'result';

// ─── Fighter configs ───────────────────────────────────────────

function createFighter(
  char: Character,
  x: number,
  facing: 1 | -1,
  color: string
): FighterState {
  return {
    x,
    y: 0,
    vx: 0,
    vy: 0,
    hp: 100,
    maxHp: 100,
    width: 60,
    height: 100,
    facing,
    isAttacking: false,
    attackType: null,
    attackTimer: 0,
    hitTimer: 0,
    combo: 0,
    canAct: true,
    isBlocking: false,
    specialCooldown: 0,
    blastCooldown: 0,
    slamCooldown: 0,
    comboMeter: 0,
    maxComboMeter: 100,
    isCharging: false,
            chargeAmount: 0,
            chargedAttack: false,
            name: char.name,
    color,
    imageUrl: char.imageUrl,
    scale: 1,
  };
}

// ─── Fighting game component ────────────────────────────────────

export default function FightPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const gameRef = useRef<{
    p1: FighterState;
    p2: FighterState;
    phase: GamePhase;
    round: number;
    timer: number;
    announcer: string;
    announcerTimer: number;
    screenShake: number;
    comboText: string;
    comboTextTimer: number;
    winner: 'p1' | 'p2' | null;
  } | null>(null);
  const animFrameRef = useRef<number>(0);

  const [gamePhase, setGamePhase] = useState<GamePhase>('select');
  const [player1, setPlayer1] = useState<Character | null>(null);
  const [player2, setPlayer2] = useState<Character | null>(null);
  const [selectingFor, setSelectingFor] = useState<'p1' | 'p2'>('p1');
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [resultText, setResultText] = useState('');
  const [generatingReplay, setGeneratingReplay] = useState(false);

  const filtered = useMemo(() => {
    let list = characters;
    if (category !== 'All') list = list.filter((c) => c.category === category);
    if (search)
      list = list.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
    return list;
  }, [category, search]);

  // ─── Initialize game ──────────────────────────────────────────

  const startGame = useCallback(() => {
    if (!player1 || !player2 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const p1 = createFighter(player1, 150, 1, '#ef4444');
    const p2 = createFighter(player2, canvas.width - 150, -1, '#3b82f6');

    p1.y = canvas.height - p1.height - 40;
    p2.y = canvas.height - p2.height - 40;

    gameRef.current = {
      p1,
      p2,
      phase: 'vs',
      round: 1,
      timer: 99,
      announcer: 'FIGHT!',
      announcerTimer: 90,
      screenShake: 0,
      comboText: '',
      comboTextTimer: 0,
      winner: null,
    };

    setGamePhase('fight');
    setResultText('');

    // VS screen for 2 seconds, then fight
    setTimeout(() => {
      if (gameRef.current) {
        gameRef.current.phase = 'fight';
        gameRef.current.announcer = 'FIGHT!';
        gameRef.current.announcerTimer = 60;
      }
    }, 2000);
  }, [player1, player2]);

  // ─── Game Loop ────────────────────────────────────────────────

  useEffect(() => {
    if (gamePhase !== 'fight') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;

    const gameLoop = () => {
      const game = gameRef.current;
      if (!game || game.phase === 'ko' || game.phase === 'result') return;

      frameCount++;
      const { p1, p2 } = game;

      // ── Input ──
      p1.vx = 0;
      p1.vy = 0;
      p1.isBlocking = false;
      p1.isCharging = false;

      if (p1.canAct) {
        const keys = keysRef.current;
        if (keys.has('a')) {
          p1.vx = -4;
          p1.facing = -1;
        }
        if (keys.has('d')) {
          p1.vx = 4;
          p1.facing = 1;
        }
        if (keys.has('w')) p1.vy = -4;
        if (keys.has('s') && !keys.has('a') && !keys.has('d')) {
          p1.isBlocking = true;
        }

        // Charge: hold Enter to charge up
        if (keys.has('enter') && !p1.isAttacking) {
          p1.isCharging = true;
          p1.chargeAmount = Math.min(100, p1.chargeAmount + 1.5);
          p1.vx *= 0.3;
        }

        if (keys.has('j') && !p1.isAttacking && p1.canAct) {
                      p1.isAttacking = true;
                      p1.attackType = 'punch';
                      p1.attackTimer = 15;
                      p1.canAct = false;
                      // Apply charge bonus - 2x damage
                      if (p1.chargeAmount > 0) {
                        p1.chargedAttack = true;
                        p1.chargeAmount = 0;
                      }
                    }
                    if (keys.has('k') && !p1.isAttacking && p1.canAct) {
                      p1.isAttacking = true;
                      p1.attackType = 'kick';
                      p1.attackTimer = 20;
                      p1.canAct = false;
                      if (p1.chargeAmount > 0) {
                        p1.chargedAttack = true;
                        p1.chargeAmount = 0;
                      }
                    }
                    if (keys.has('l') && !p1.isAttacking && p1.canAct && p1.specialCooldown <= 0) {
                      p1.isAttacking = true;
                      p1.attackType = 'special';
                      p1.attackTimer = 30;
                      p1.canAct = false;
                      p1.specialCooldown = 180;
                      if (p1.chargeAmount > 0) {
                        p1.chargedAttack = true;
                        p1.chargeAmount = 0;
                      }
                    }
                    // U = ranged energy blast
                    if (keys.has('u') && !p1.isAttacking && p1.canAct && p1.blastCooldown <= 0) {
                      p1.isAttacking = true;
                      p1.attackType = 'blast';
                      p1.attackTimer = 25;
                      p1.canAct = false;
                      p1.blastCooldown = 120;
                      if (p1.chargeAmount > 0) {
                        p1.chargedAttack = true;
                        p1.chargeAmount = 0;
                      }
                    }
                    // I = ground slam AOE
                    if (keys.has('i') && !p1.isAttacking && p1.canAct && p1.slamCooldown <= 0) {
                      p1.isAttacking = true;
                      p1.attackType = 'slam';
                      p1.attackTimer = 35;
                      p1.canAct = false;
                      p1.slamCooldown = 150;
                      if (p1.chargeAmount > 0) {
                        p1.chargedAttack = true;
                        p1.chargeAmount = 0;
                      }
                    }
                    // O = ultimate super (needs full combo meter)
                    if (keys.has('o') && !p1.isAttacking && p1.canAct && p1.comboMeter >= p1.maxComboMeter) {
                      p1.isAttacking = true;
                      p1.attackType = 'ultimate';
                      p1.attackTimer = 50;
                      p1.canAct = false;
                      p1.comboMeter = 0;
                      p1.specialCooldown = 300;
                      if (p1.chargeAmount > 0) {
                        p1.chargedAttack = true;
                        p1.chargeAmount = 0;
                      }
                    }
      }

      // ── AI for P2 ──
      p2.vx = 0;
      p2.vy = 0;
      p2.isBlocking = false;

      if (p2.canAct) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.abs(dx);

        p2.facing = dx > 0 ? 1 : -1;

        if (dist > 80) {
          p2.vx = dx > 0 ? 2.5 : -2.5;
        } else if (dist < 50) {
          p2.vx = dx > 0 ? -2 : 2;
        }

        if (Math.abs(dy) > 20) {
          p2.vy = dy > 0 ? 2 : -2;
        }

        // AI decision making
        if (dist < 100 && !p2.isAttacking) {
          const roll = Math.random();
          if (roll < 0.25 && p2.comboMeter >= p2.maxComboMeter) {
            p2.isAttacking = true;
            p2.attackType = 'ultimate';
            p2.attackTimer = 50;
            p2.canAct = false;
            p2.comboMeter = 0;
            p2.specialCooldown = 300;
          } else if (roll < 0.4 && p2.specialCooldown <= 0) {
            p2.isAttacking = true;
            p2.attackType = 'special';
            p2.attackTimer = 30;
            p2.canAct = false;
            p2.specialCooldown = 180;
          } else if (roll < 0.5 && p2.blastCooldown <= 0) {
            p2.isAttacking = true;
            p2.attackType = 'blast';
            p2.attackTimer = 25;
            p2.canAct = false;
            p2.blastCooldown = 120;
          } else if (roll < 0.6 && p2.slamCooldown <= 0) {
            p2.isAttacking = true;
            p2.attackType = 'slam';
            p2.attackTimer = 35;
            p2.canAct = false;
            p2.slamCooldown = 150;
          } else if (roll < 0.75) {
            p2.isAttacking = true;
            p2.attackType = 'kick';
            p2.attackTimer = 20;
            p2.canAct = false;
          } else if (roll < 0.88) {
            p2.isAttacking = true;
            p2.attackType = 'punch';
            p2.attackTimer = 15;
            p2.canAct = false;
          } else if (dist < 60) {
            p2.isBlocking = true;
          }
        }
      }

      // ── Apply velocities ──
      p1.x += p1.vx;
      p1.y += p1.vy;
      p2.x += p2.vx;
      p2.y += p2.vy;

      // ── Boundaries ──
      p1.x = Math.max(40, Math.min(canvas.width - 40, p1.x));
      p1.y = Math.max(40, Math.min(canvas.height - p1.height - 40, p1.y));
      p2.x = Math.max(40, Math.min(canvas.width - 40, p2.x));
      p2.y = Math.max(40, Math.min(canvas.height - p2.height - 40, p2.y));

      // ── Collision / push apart ──
      if (Math.abs(p1.x - p2.x) < p1.width) {
        if (p1.x < p2.x) {
          p1.x -= 2;
          p2.x += 2;
        } else {
          p1.x += 2;
          p2.x -= 2;
        }
      }

      // ── Attack hit detection ──
      const checkHit = (attacker: FighterState, defender: FighterState) => {
        if (!attacker.isAttacking) return false;
        const dist = Math.abs(attacker.x - defender.x);
        const yDist = Math.abs(attacker.y - defender.y);
        let reach = 60;
        if (attacker.attackType === 'special') reach = 120;
        else if (attacker.attackType === 'kick') reach = 80;
        else if (attacker.attackType === 'blast') reach = 200;
        else if (attacker.attackType === 'slam') reach = 100;
        else if (attacker.attackType === 'ultimate') reach = 250;

        // Blast and Ultimate are ranged - no facing check needed
        if (attacker.attackType === 'blast' || attacker.attackType === 'ultimate') {
          return dist < reach && yDist < 80;
        }
        // Slam hits on both sides
        if (attacker.attackType === 'slam') {
          return dist < reach && yDist < 60;
        }

        if (dist < reach && yDist < 50 && attacker.facing === (attacker.x < defender.x ? 1 : -1)) {
          return true;
        }
        // Check if facing each other
        const facingRight = attacker.facing === 1;
        const attackerIsLeft = attacker.x < defender.x;
        if (facingRight !== attackerIsLeft) return false;
        return dist < reach && yDist < 60;
      };

      // P1 hits P2
                if (checkHit(p1, p2)) {
                  let dmg = 0;
                  if (p1.attackType === 'punch') dmg = 8 + (p1.combo > 0 ? p1.combo * 2 : 0);
                  else if (p1.attackType === 'kick') dmg = 12 + (p1.combo > 0 ? p1.combo * 2 : 0);
                  else if (p1.attackType === 'special') dmg = 25;
                  else if (p1.attackType === 'blast') dmg = 18;
                  else if (p1.attackType === 'slam') dmg = 22;
                  else if (p1.attackType === 'ultimate') dmg = 40;

                  // Charged attack does 2x damage
                  if (p1.chargedAttack) {
                    dmg *= 2;
                    p1.chargedAttack = false;
                  }

        if (p2.isBlocking) dmg = Math.floor(dmg * 0.3);

        p2.hp = Math.max(0, p2.hp - dmg);
        p2.hitTimer = 10;
        p2.canAct = false;

        // Build combo meter on hit
        p1.comboMeter = Math.min(p1.maxComboMeter, p1.comboMeter + dmg);

        p1.combo++;
        p1.isAttacking = false;
        p1.attackTimer = 0;
        game.screenShake = dmg > 15 ? 15 : 8;

        if (p1.combo >= 3) {
          game.comboText = `${p1.combo} HIT COMBO!`;
          game.comboTextTimer = 60;
        }

        // Knockback
        const kb = dmg > 15 ? 20 : 10;
        p2.vx = p2.x > p1.x ? kb : -kb;
        p2.vy = -5;

        setTimeout(() => {
          if (p2) p2.canAct = true;
        }, 200);

        if (p2.hp <= 0) {
          game.phase = 'ko';
          game.announcer = 'K.O.!';
          game.announcerTimer = 120;
          game.winner = 'p1';
          game.screenShake = 25;
          setTimeout(() => {
            if (game) game.phase = 'result';
            setGamePhase('result');
            setResultText(`${player1?.name} Wins!`);
          }, 2000);
        }
      }

      // P2 hits P1
                if (checkHit(p2, p1)) {
                  let dmg = 0;
                  if (p2.attackType === 'punch') dmg = 7;
                  else if (p2.attackType === 'kick') dmg = 10;
                  else if (p2.attackType === 'special') dmg = 20;
                  else if (p2.attackType === 'blast') dmg = 15;
                  else if (p2.attackType === 'slam') dmg = 18;
                  else if (p2.attackType === 'ultimate') dmg = 40;

        if (p1.isBlocking) dmg = Math.floor(dmg * 0.3);

        p1.hp = Math.max(0, p1.hp - dmg);
        p1.hitTimer = 10;
        p1.canAct = false;

        // Build combo meter for AI
        p2.comboMeter = Math.min(p2.maxComboMeter, p2.comboMeter + dmg);

        p2.combo++;
        p2.isAttacking = false;
        p2.attackTimer = 0;
        game.screenShake = dmg > 15 ? 12 : 6;

        if (p2.combo >= 3) {
          game.comboText = `${p2.combo} HIT COMBO!`;
          game.comboTextTimer = 60;
        }

        const kb = dmg > 15 ? 18 : 8;
        p1.vx = p1.x > p2.x ? kb : -kb;
        p1.vy = -5;

        setTimeout(() => {
          if (p1) p1.canAct = true;
        }, 200);

        if (p1.hp <= 0) {
          game.phase = 'ko';
          game.announcer = 'K.O.!';
          game.announcerTimer = 120;
          game.winner = 'p2';
          game.screenShake = 25;
          setTimeout(() => {
            if (game) game.phase = 'result';
            setGamePhase('result');
            setResultText(`${player2?.name} Wins!`);
          }, 2000);
        }
      }

      // ── Timers ──
      if (p1.attackTimer > 0) {
        p1.attackTimer--;
        if (p1.attackTimer === 0) {
          p1.isAttacking = false;
          p1.attackType = null;
          p1.canAct = true;
        }
      }
      if (p2.attackTimer > 0) {
        p2.attackTimer--;
        if (p2.attackTimer === 0) {
          p2.isAttacking = false;
          p2.attackType = null;
          p2.canAct = true;
        }
      }

      if (p1.hitTimer > 0) p1.hitTimer--;
      if (p2.hitTimer > 0) p2.hitTimer--;
      if (p1.specialCooldown > 0) p1.specialCooldown--;
      if (p2.specialCooldown > 0) p2.specialCooldown--;
      if (p1.blastCooldown > 0) p1.blastCooldown--;
      if (p2.blastCooldown > 0) p2.blastCooldown--;
      if (p1.slamCooldown > 0) p1.slamCooldown--;
      if (p2.slamCooldown > 0) p2.slamCooldown--;
      // Charge decays when not holding enter
      if (!p1.isCharging && p1.chargeAmount > 0) p1.chargeAmount = Math.max(0, p1.chargeAmount - 1);
      if (game.screenShake > 0) game.screenShake *= 0.85;
      if (game.comboTextTimer > 0) game.comboTextTimer--;
      if (game.announcerTimer > 0) game.announcerTimer--;

      // ── Match timer ──
      if (frameCount % 60 === 0 && game.phase === 'fight') {
        game.timer--;
        if (game.timer <= 0) {
          game.phase = 'ko';
          game.announcer = "TIME'S UP!";
          game.announcerTimer = 120;
          game.winner = p1.hp > p2.hp ? 'p1' : p2.hp > p1.hp ? 'p2' : null;
          setTimeout(() => {
            if (game) game.phase = 'result';
            const winner =
              p1.hp > p2.hp ? player1?.name : p2.hp > p1.hp ? player2?.name : 'Draw';
            setGamePhase('result');
            setResultText(winner === 'Draw' ? 'Draw!' : `${winner} Wins!`);
          }, 2000);
        }
      }

      // ── Render ──
      render(ctx, canvas, game);

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gamePhase, player1, player2]);

  // ─── Render Function ──────────────────────────────────────────

  function render(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    game: NonNullable<typeof gameRef.current>
  ) {
    const { p1, p2 } = game;
    const W = canvas.width;
    const H = canvas.height;

    ctx.save();

    // Screen shake
    if (game.screenShake > 1) {
      const sx = (Math.random() - 0.5) * game.screenShake;
      const sy = (Math.random() - 0.5) * game.screenShake;
      ctx.translate(sx, sy);
    }

    // ── Background ──
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(0.4, '#1a0a2e');
    grad.addColorStop(0.7, '#2a1040');
    grad.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // ── Arena floor ──
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, H - 30, W, 30);
    ctx.strokeStyle = '#4444aa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, H - 30);
    ctx.lineTo(W, H - 30);
    ctx.stroke();

    // Floor grid lines
    ctx.strokeStyle = 'rgba(100, 100, 200, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, H - 30);
      ctx.lineTo(i, H);
      ctx.stroke();
    }

    // ── Health bars ──
    const barW = 250;
    const barH = 24;
    const barY = 20;
    const barX1 = 40;
    const barX2 = W - 40 - barW;

    // P1 Health bar
    ctx.fillStyle = '#333';
    ctx.fillRect(barX1, barY, barW, barH);
    const p1Pct = p1.hp / p1.maxHp;
    const p1Color = p1Pct > 0.5 ? '#22c55e' : p1Pct > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillStyle = p1Color;
    ctx.fillRect(barX1, barY, barW * p1Pct, barH);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX1, barY, barW, barH);

    // P1 name
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(p1.name, barX1, barY - 6);

    // P1 Combo meter bar
    const meterY = barY + barH + 4;
    ctx.fillStyle = '#333';
    ctx.fillRect(barX1, meterY, barW, 6);
    const p1MeterPct = p1.comboMeter / p1.maxComboMeter;
    ctx.fillStyle = p1MeterPct >= 1 ? '#ec4899' : '#a855f7';
    ctx.fillRect(barX1, meterY, barW * p1MeterPct, 6);
    if (p1MeterPct >= 1) {
      ctx.fillStyle = '#ec4899';
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
      ctx.fillRect(barX1, meterY, barW, 6);
      ctx.globalAlpha = 1;
    }

    // P1 Charge indicator
    if (p1.chargeAmount > 0) {
      ctx.fillStyle = '#facc15';
      ctx.globalAlpha = 0.6;
      ctx.fillRect(barX1, meterY + 8, barW * (p1.chargeAmount / 100), 4);
      ctx.globalAlpha = 1;
    }

    // P2 Health bar
    ctx.fillStyle = '#333';
    ctx.fillRect(barX2, barY, barW, barH);
    const p2Pct = p2.hp / p2.maxHp;
    const p2Color = p2Pct > 0.5 ? '#22c55e' : p2Pct > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillStyle = p2Color;
    ctx.fillRect(barX2, barY, barW * p2Pct, barH);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX2, barY, barW, barH);

    // P2 name
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(p2.name, barX2 + barW, barY - 6);

    // P2 Combo meter bar
    ctx.fillStyle = '#333';
    ctx.fillRect(barX2, meterY, barW, 6);
    const p2MeterPct = p2.comboMeter / p2.maxComboMeter;
    ctx.fillStyle = p2MeterPct >= 1 ? '#ec4899' : '#a855f7';
    ctx.fillRect(barX2, meterY, barW * p2MeterPct, 6);
    if (p2MeterPct >= 1) {
      ctx.fillStyle = '#ec4899';
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
      ctx.fillRect(barX2, meterY, barW, 6);
      ctx.globalAlpha = 1;
    }

    // Timer
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(game.timer), W / 2, barY + 22);

    // ── Combo text ──
    if (game.comboTextTimer > 0 && game.comboText) {
      ctx.save();
      ctx.fillStyle = '#facc15';
      ctx.font = `bold ${32 + (60 - game.comboTextTimer) * 0.2}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.globalAlpha = game.comboTextTimer / 60;
      ctx.fillText(game.comboText, W / 2, H / 2 - 40);
      ctx.restore();
    }

    // ── Announcer ──
    if (game.announcerTimer > 0 && game.announcer) {
      ctx.save();
      const alpha = Math.min(1, game.announcerTimer / 30);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = game.phase === 'ko' ? '#ef4444' : '#facc15';
      ctx.font = `bold ${game.phase === 'ko' ? 80 : 60}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = game.phase === 'ko' ? '#ef4444' : '#facc15';
      ctx.shadowBlur = 20;
      ctx.fillText(game.announcer, W / 2, H / 2 + 60);
      ctx.restore();
    }

    // ── Draw fighters ──
    drawFighter(ctx, p1, p1.color);
    drawFighter(ctx, p2, p2.color);

    ctx.restore();
  }

  function drawFighter(
    ctx: CanvasRenderingContext2D,
    f: FighterState,
    color: string
  ) {
    ctx.save();

    const cx = f.x;
    const cy = f.y;
    const w = f.width;
    const h = f.height;

    // Flash on hit
    if (f.hitTimer > 0 && f.hitTimer % 4 < 2) {
      ctx.globalAlpha = 0.6;
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx + w / 2, cy + h + 5, w / 2 + 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = color;
    const bodyColor = color;
    ctx.fillStyle = bodyColor;
    ctx.shadowColor = color;
    ctx.shadowBlur = f.hitTimer > 0 ? 15 : 5;

    // Body (rounded rect)
    const bx = cx + 10;
    const by = cy + 30;
    const bw = w - 20;
    const bh = h - 40;
    roundRect(ctx, bx, by, bw, bh, 8);
    ctx.fill();

    // Head
    ctx.fillStyle = '#ffccaa';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(cx + w / 2, cy + 18, 16, 0, Math.PI * 2);
    ctx.fill();

    // Hair/headband
    ctx.fillStyle = f.hitTimer > 0 ? '#fff' : color;
    ctx.fillRect(cx + w / 2 - 14, cy + 2, 28, 8);

    // Eyes
    ctx.fillStyle = '#333';
    const eyeDir = f.facing === 1 ? 3 : -3;
    ctx.fillRect(cx + w / 2 - 6 + eyeDir, cy + 14, 4, 4);
    ctx.fillRect(cx + w / 2 + 2 + eyeDir, cy + 14, 4, 4);

    // Arms
    const armSwing = f.isAttacking
      ? Math.sin(f.attackTimer * 0.8) * 20
      : 0;
    ctx.fillStyle = '#ffccaa';
    ctx.shadowBlur = 0;

    if (f.isAttacking) {
      // Attack arm extended
      const armDir = f.facing;
      ctx.fillRect(
        cx + w / 2 + (armDir > 0 ? 5 : -15) + armSwing * armDir,
        cy + 32,
        20 + Math.abs(armSwing),
        8
      );

      // Attack base effect
      ctx.fillStyle = '#facc15';
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(
        cx + w / 2 + (f.facing === 1 ? 40 : -40) + armSwing * f.facing,
        cy + 36,
        12,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.globalAlpha = 1;

      // Special effect
      if (f.attackType === 'special') {
        ctx.fillStyle = '#a855f7';
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(
          cx + w / 2 + (f.facing === 1 ? 60 : -60),
          cy + 36,
          30,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Blast effect - blue energy ball
      if (f.attackType === 'blast') {
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 20;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(
          cx + w / 2 + (f.facing === 1 ? 80 : -80),
          cy + 36,
          16 + Math.sin(f.attackTimer * 0.5) * 4,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Trail effect
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(
          cx + w / 2 + (f.facing === 1 ? 100 + Math.sin(f.attackTimer) * 20 : -100 - Math.sin(f.attackTimer) * 20),
          cy + 36,
          8,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      // Slam effect - ground shake ring
      if (f.attackType === 'slam') {
        ctx.fillStyle = '#f97316';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 15;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(cx + w / 2, cy + h - 10, 20 + (35 - f.attackTimer) * 2, 0, Math.PI * 2);
        ctx.fill();
        // Inner ring
        ctx.fillStyle = '#ef4444';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(cx + w / 2, cy + h - 10, 10 + (35 - f.attackTimer), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      // Ultimate effect - golden energy explosion
                if (f.attackType === 'ultimate') {
                  ctx.fillStyle = '#facc15';
                  ctx.shadowColor = '#facc15';
                  ctx.shadowBlur = 30;
                  ctx.globalAlpha = 0.5;
                  // Outer blast - gold
                  ctx.beginPath();
                  ctx.arc(
                    cx + w / 2,
                    cy + 36,
                    40 + (50 - f.attackTimer) * 1.5,
                    0,
                    Math.PI * 2
                  );
                  ctx.fill();
                  // Inner blast - bright gold
                  ctx.fillStyle = '#fbbf24';
                  ctx.shadowColor = '#fbbf24';
                  ctx.shadowBlur = 40;
                  ctx.globalAlpha = 0.7;
                  ctx.beginPath();
                  ctx.arc(
                    cx + w / 2,
                    cy + 36,
                    20 + (50 - f.attackTimer),
                    0,
                    Math.PI * 2
                  );
                  ctx.fill();
                  // White core
                  ctx.fillStyle = '#ffffff';
                  ctx.shadowBlur = 50;
                  ctx.globalAlpha = 0.9;
                  ctx.beginPath();
                  ctx.arc(cx + w / 2, cy + 36, 10 + (50 - f.attackTimer) * 0.3, 0, Math.PI * 2);
                  ctx.fill();
                  // Golden particles
                  ctx.shadowBlur = 0;
                  ctx.globalAlpha = 0.6;
                  ctx.fillStyle = '#fef08a';
                  for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2 + f.attackTimer * 0.3;
                    const dist = 30 + (50 - f.attackTimer) * 1.5 + Math.sin(f.attackTimer + i) * 10;
                    ctx.beginPath();
                    ctx.arc(
                      cx + w / 2 + Math.cos(angle) * dist,
                      cy + 36 + Math.sin(angle) * dist,
                      4,
                      0,
                      Math.PI * 2
                    );
                    ctx.fill();
                  }
                  ctx.shadowBlur = 0;
                  ctx.globalAlpha = 1;
                }
    } else {
      // Normal arm position
      ctx.fillRect(cx + 5, cy + 32, 10, 6);
      ctx.fillRect(cx + w - 15, cy + 32, 10, 6);
    }

    // Legs
    ctx.fillStyle = '#1a1a3a';
    ctx.fillRect(cx + 12, cy + h - 20, 14, 20);
    ctx.fillRect(cx + w - 26, cy + h - 20, 14, 20);

    // Blocking indicator
    if (f.isBlocking) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(cx + w / 2, cy + h / 2, 35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Name tag
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 0;
    ctx.fillText(f.name, cx + w / 2, cy + h + 18);

    // Health bar under character
    const hpW = 50;
    const hpH = 4;
    const hpX = cx + w / 2 - hpW / 2;
    const hpY = cy + h + 6;
    ctx.fillStyle = '#333';
    ctx.fillRect(hpX, hpY, hpW, hpH);
    const hpPct = f.hp / f.maxHp;
    const hpColor = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillStyle = hpColor;
    ctx.fillRect(hpX, hpY, hpW * hpPct, hpH);

    ctx.restore();
  }

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ─── Handle Generate AI Replay ────────────────────────────────

  const generateReplay = async () => {
    if (!player1 || !player2) return;
    setGeneratingReplay(true);
    try {
      const res = await fetch('/api/match/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player1Id: player1.id,
          player2Id: player2.id,
          winner: resultText.includes(player1.name) ? player1.id : player2.id,
          gameResult: resultText,
        }),
      });
      const data = await res.json();
      if (data.matchId) {
        router.push(`/match/${data.matchId}`);
      } else {
        alert('Failed to generate replay. Please try again.');
        setGeneratingReplay(false);
      }
    } catch {
      alert('Error generating replay. Please try again.');
      setGeneratingReplay(false);
    }
  };

  // ─── Keyboard handlers ────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      if (gamePhase === 'result' && (e.key === 'Enter' || e.key === ' ')) {
        handleRematch();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gamePhase]);

  // ─── Character selection ──────────────────────────────────────

  const handleSelect = (char: Character) => {
    if (selectingFor === 'p1') {
      setPlayer1(char);
      setSelectingFor('p2');
    } else {
      setPlayer2(char);
      setSelectingFor('p1');
    }
  };

  const handleRematch = () => {
    if (!player1 || !player2) return;
    startGame();
  };

  const resetSelection = () => {
    setPlayer1(null);
    setPlayer2(null);
    setSelectingFor('p1');
    setSearch('');
    setCategory('All');
    setGamePhase('select');
    setResultText('');
  };

  // ─── Render ────────────────────────────��──────────────────────

  // Character selection screen
  if (gamePhase === 'select' || gamePhase === 'vs') {
    if (gamePhase === 'vs' && player1 && player2) {
      return (
        <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
          <canvas
            ref={canvasRef}
            width={900}
            height={500}
            className="w-full max-w-4xl rounded-xl"
          />
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-red-500">
              FIGHTING GAME
            </h1>
            <p className="text-gray-400 mt-2">
              {selectingFor === 'p1'
                ? 'SELECT YOUR FIGHTER (P1)'
                : 'SELECT OPPONENT (P2)'}
            </p>
          </div>

          {/* Selected fighters preview */}
          <div className="flex justify-center gap-8 mb-8 items-center">
            <div className="text-center">
              <div className="w-24 h-32 rounded-lg overflow-hidden border-2 border-red-600">
                {player1 ? (
                  <img
                    src={player1.imageUrl}
                    alt={player1.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center text-3xl">
                    ?
                  </div>
                )}
              </div>
              <p className="text-xs mt-1 text-red-400">
                {player1?.name || 'P1'}
              </p>
            </div>
            <div className="text-4xl font-black text-yellow-500">VS</div>
            <div className="text-center">
              <div className="w-24 h-32 rounded-lg overflow-hidden border-2 border-blue-600">
                {player2 ? (
                  <img
                    src={player2.imageUrl}
                    alt={player2.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center text-3xl">
                    ?
                  </div>
                )}
              </div>
              <p className="text-xs mt-1 text-blue-400">
                {player2?.name || 'P2'}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                  category === cat
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-6">
            <input
              type="text"
              placeholder="Search fighters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-500 outline-none"
            />
          </div>

          {/* Character grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {filtered.map((char) => (
              <button
                key={char.id}
                onClick={() => handleSelect(char)}
                className={`group relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                  player1?.id === char.id || player2?.id === char.id
                    ? 'border-yellow-500 ring-2 ring-yellow-500/50'
                    : selectingFor === 'p1'
                    ? 'border-red-800 hover:border-red-500'
                    : 'border-blue-800 hover:border-blue-500'
                }`}
              >
                <div className="aspect-[3/4] bg-gray-800">
                  <img
                    src={char.imageUrl}
                    alt={char.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-1.5">
                  <p className="text-[10px] font-bold text-white truncate">
                    {char.name}
                  </p>
                  <p className="text-[8px] text-gray-400 truncate">
                    {char.universe}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Start fight button */}
          {player1 && player2 && (
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setGamePhase('vs');
                  setTimeout(startGame, 100);
                }}
                className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 text-white py-4 px-16 rounded-full font-black text-2xl tracking-widest hover:scale-110 transition-all shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-pulse"
              >
                ⚔️ FIGHT! ⚔️
              </button>
              <p className="text-gray-500 text-xs mt-3">
                WASD: Move | J: Punch | K: Kick | L: Special | U: Blast | I: Slam | O: Ultimate | S: Block | Enter: Charge
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }

  // Fight phase
  if (gamePhase === 'fight' || gamePhase === 'ko') {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center">
        <canvas
          ref={canvasRef}
          width={900}
          height={500}
          className="w-full max-w-5xl rounded-xl"
        />
        <div className="mt-4 text-gray-500 text-sm text-center">
          <p>WASD: Move | J: Punch | K: Kick | L: Special | U: Blast | I: Slam | O: Ultimate | S: Block | Enter: Charge</p>
        </div>
      </main>
    );
  }

  // Result screen
  if (gamePhase === 'result') {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
            {resultText}
          </h1>
          {player1 && player2 && (
            <div className="flex items-center gap-8 justify-center mt-8 mb-12">
              <div className="text-center">
                <div className="w-32 h-44 rounded-xl overflow-hidden border-4 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                  <img
                    src={player1.imageUrl}
                    alt={player1.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-lg font-bold mt-2 text-red-400">
                  {player1.name}
                </p>
              </div>
              <div className="text-4xl font-black text-gray-600">VS</div>
              <div className="text-center">
                <div className="w-32 h-44 rounded-xl overflow-hidden border-4 border-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                  <img
                    src={player2.imageUrl}
                    alt={player2.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-lg font-bold mt-2 text-blue-400">
                  {player2.name}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRematch}
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-all border border-gray-600"
            >
              🔄 Rematch
            </button>
            <button
              onClick={generateReplay}
              disabled={generatingReplay}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-8 py-3 rounded-full font-bold text-lg transition-all shadow-lg disabled:opacity-50"
            >
              {generatingReplay ? 'Generating...' : '🎬 Generate AI Replay'}
            </button>
            <button
              onClick={resetSelection}
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-all border border-gray-600"
            >
              ← New Fighters
            </button>
          </div>
        </div>
      </main>
    );
  }

  return null;
}