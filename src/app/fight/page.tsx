'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { characters, Character, getSpriteUrl } from '@/data/characters';
import TouchControls from '@/components/TouchControls';
import CharacterFig from '@/components/CharacterFig';

const CATEGORIES = ['All', 'Anime', 'Cartoon', 'WWE', 'AEW', 'Toku', 'Video Games'] as const;
// A character counts as "female" for the roster filter if it has the kiss-drain flag
const charKissFlag = (c: Character): boolean => !!c.kissDrain;
// Distinct solid background color per category (no images — clean colored badges)
function catColorClass(cat?: string): string {
  switch ((cat || '').toLowerCase()) {
    case 'anime': return 'bg-gradient-to-br from-orange-500 to-red-600';
    case 'cartoon': return 'bg-gradient-to-br from-pink-500 to-purple-600';
    case 'wwe': return 'bg-gradient-to-br from-red-600 to-rose-700';
    case 'aew': return 'bg-gradient-to-br from-green-600 to-emerald-700';
    case 'toku': return 'bg-gradient-to-br from-sky-500 to-blue-700';
    case 'video games': return 'bg-gradient-to-br from-amber-500 to-orange-600';
    default: return 'bg-gradient-to-br from-gray-600 to-gray-800';
  }
}

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
  attackType: 'punch' | 'kick' | 'special' | 'blast' | 'slam' | 'ultimate' | 'grab' | 'kiss' | null;
  attackTimer: number;
  hitTimer: number;
  isGrabbed: boolean;
  grabHit: boolean;
  isKissed: boolean;
  kissDrain: boolean;
  kissName: string;
  kissPoison: boolean;
  poisoned: number;
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
  finisher: string;
  finisherColor: string;
  finisherType: string;
  finisherType2: string;
  finisherType3: string;
  finisherType4: string;
  finisherTypeActive: string;
  finisher2: string;
  finisher3: string;
  finisher4: string;
  imageUrl: string;
  portraitUrl: string | null;
  scale: number;
}

type GamePhase = 'select' | 'vs' | 'fight' | 'ko' | 'result';

// ─── Portrait helpers ──────────────────────────────────────────

// Cache of loaded portrait images keyed by URL (module-level so it persists
// across fights without re-fetching).
const portraitCache = new Map<string, HTMLImageElement>();

function loadPortrait(url: string): HTMLImageElement | null {
  if (portraitCache.has(url)) return portraitCache.get(url) || null;
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => portraitCache.set(url, img);
  img.onerror = () => portraitCache.set(url, img); // cache the failed img; drawFighter falls back
  img.src = url;
  portraitCache.set(url, img);
  return img;
}

/** Returns the portrait image only once it is fully loaded (else null → fallback rendering). */
function getLoadedPortrait(f: { portraitUrl: string | null }): HTMLImageElement | null {
  if (!f.portraitUrl) return null;
  const img = loadPortrait(f.portraitUrl);
  if (img && img.complete && img.naturalWidth > 0) return img;
  return null;
}

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
    isGrabbed: false,
    grabHit: false,
    isKissed: false,
    kissDrain: !!char.kissDrain,
    kissName: char.kissName || 'KISS',
    kissPoison: !!char.kissPoison,
    poisoned: 0,
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
    finisher: char.finisher,
    finisherColor: char.finisherColor,
    finisherType: char.finisherType,
    finisherType2: char.finisherType2,
    finisherType3: char.finisherType3,
    finisherType4: char.finisherType4,
    finisherTypeActive: char.finisherType,
    finisher2: char.finisher2,
    finisher3: char.finisher3,
    finisher4: char.finisher4,
    imageUrl: char.imageUrl,
    portraitUrl: getSpriteUrl(char),
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
  const [femaleOnly, setFemaleOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [resultText, setResultText] = useState('');
  const [generatingReplay, setGeneratingReplay] = useState(false);
  const autoStartRef = useRef(false);
  const [visibleCount, setVisibleCount] = useState(60);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(60);
  }, [category, search]);

  const filtered = useMemo(() => {
    let list = characters;
    if (category !== 'All') list = list.filter((c) => c.category === category);
    if (femaleOnly) list = list.filter((c) => !!charKissFlag(c));
    if (search)
      list = list.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
    return list;
  }, [category, femaleOnly, search]);

  // ─── Audio System ─────────────────────────────────────────────
  const [isMuted, setIsMuted] = useState(false);
  const [musicChoice, setMusicChoice] = useState<'auto' | 'kmix' | 'kpop1' | 'kpop2' | 'kpop3' | 'kpop4' | 'kpop5' | 'ten' | 'toku' | 'anime' | 'wrestling' | 'cartoon'>('auto');
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);

  const playSfx = useCallback((type: 'punch' | 'kick' | 'special' | 'blast' | 'slam' | 'ultimate' | 'block' | 'hit') => {
    if (isMuted) return;
    try {
      const sfx = new Audio();
      sfx.volume = 0.3;
      const sounds: Record<string, string> = {
        punch: '/sfx/punch.wav',
        kick: '/sfx/kick.wav',
        special: '/sfx/special.wav',
        blast: '/sfx/blast.wav',
        slam: '/sfx/slam.wav',
        ultimate: '/sfx/ultimate.wav',
        block: '/sfx/block.wav',
        hit: '/sfx/hit.wav',
      };
      sfx.src = sounds[type] || sounds.punch;
      sfx.play().catch(() => {});
      sfxRef.current = sfx;
    } catch {}
  }, [isMuted]);

  useEffect(() => {
    if (isMuted) {
      if (bgmRef.current) { bgmRef.current.pause(); bgmRef.current = null; }
      return;
    }
    if (!player1 && !player2) return;
    let musicUrl = '/music/default.wav';
    if (musicChoice === 'kpop1') musicUrl = '/music/kpop1.wav';
    else if (musicChoice === 'kpop2') musicUrl = '/music/kpop2.wav';
    else if (musicChoice === 'kpop3') musicUrl = '/music/kpop3.wav';
    else if (musicChoice === 'kpop4') musicUrl = '/music/kpop4.wav';
    else if (musicChoice === 'kpop5') musicUrl = '/music/kpop5.wav';
    else if (musicChoice === 'kmix') musicUrl = '/music/kpop' + (1 + Math.floor(Math.random() * 5)) + '.wav';
    else if (musicChoice === 'ten') musicUrl = '/music/dream10.wav';
    else if (musicChoice === 'toku') musicUrl = '/music/toku.wav';
    else if (musicChoice === 'anime') musicUrl = '/music/anime.wav';
    else if (musicChoice === 'wrestling') musicUrl = '/music/wrestling.wav';
    else if (musicChoice === 'cartoon') musicUrl = '/music/cartoon.wav';
    else {
      const cats = new Set<string>([player1?.category, player2?.category].filter(Boolean) as string[]);
      if (cats.has('Toku')) musicUrl = '/music/toku.wav';
      else if (cats.has('Anime')) musicUrl = '/music/anime.wav';
      else if (cats.has('WWE') || cats.has('AEW')) musicUrl = '/music/wrestling.wav';
      else if (cats.has('Cartoon')) musicUrl = '/music/cartoon.wav';
      else if (cats.has('K-Pop')) musicUrl = '/music/kpop' + (1 + Math.floor(Math.random() * 5)) + '.wav';
      else {
        // No category match: rotate K-pop into the automatic music
        const pool = ['default', 'kpop1', 'kpop2', 'kpop3', 'kpop4', 'kpop5'];
        musicUrl = '/music/' + pool[Math.floor(Math.random() * pool.length)] + '.wav';
      }
    }
    if (bgmRef.current) bgmRef.current.pause();
    const bgm = new Audio(musicUrl);
    bgm.loop = true;
    bgm.volume = 0.18;
    // Browsers block autoplay without a user gesture; start on first
    // pointer/key input if the initial play() was rejected.
    bgm.play().catch(() => {});
    bgmRef.current = bgm;
    return () => {
      if (bgmRef.current) { bgmRef.current.pause(); bgmRef.current = null; }
    };
  }, [player1, player2, isMuted, musicChoice]);

  // Resume BGM on the first user gesture (autoplay policy workaround)
  useEffect(() => {
    const resume = () => {
      if (bgmRef.current && !isMuted) bgmRef.current.play().catch(() => {});
    };
    window.addEventListener('pointerdown', resume);
    window.addEventListener('keydown', resume);
    return () => {
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
    };
  }, [isMuted]);

  // ─── Initialize game ──────────────────────────────────────────

  const startGame = useCallback(() => {
    if (!player1 || !player2 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const p1 = createFighter(player1, 150, 1, '#ef4444');
    const p2 = createFighter(player2, canvas.width - 150, -1, '#3b82f6');

    // Preload portraits so the canvas renders real art the moment the fight starts
    if (p1.portraitUrl) loadPortrait(p1.portraitUrl);
    if (p2.portraitUrl) loadPortrait(p2.portraitUrl);

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

  // ─── URL deep link (?p1=&p2=) — auto-start a match ────────────
  // No grid ever: with picks, fight those two; without picks, instantly
  // generate a random dream match (different categories) and start it.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p1id = params.get('p1');
    const p2id = params.get('p2');
    const hasDeepLink = !!(p1id && p2id);
    let c1: Character | undefined;
    let c2: Character | undefined;
    if (hasDeepLink) {
      c1 = characters.find((c) => String(c.id) === p1id);
      c2 = characters.find((c) => String(c.id) === p2id);
    }
    if (!hasDeepLink) return; // plain /fight → show the character select grid
    if (!c1 || !c2) {
      const cats = ['Anime', 'Cartoon', 'WWE', 'AEW', 'Toku', 'Video Games'];
      const cat1 = cats[Math.floor(Math.random() * cats.length)];
      let cat2 = cats[Math.floor(Math.random() * cats.length)];
      if (cat2 === cat1) cat2 = cats[(cats.indexOf(cat1) + 1 + Math.floor(Math.random() * (cats.length - 1))) % cats.length];
      const pool1 = characters.filter((c) => c.category === cat1);
      const pool2 = characters.filter((c) => c.category === cat2);
      if (pool1.length) c1 = pool1[Math.floor(Math.random() * pool1.length)];
      if (pool2.length) c2 = pool2[Math.floor(Math.random() * pool2.length)];
    }
    if (c1 && c2) {
      setPlayer1(c1);
      setPlayer2(c2);
      autoStartRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!autoStartRef.current || !player1 || !player2) return;
    autoStartRef.current = false;
    setGamePhase('vs');
    const t = setTimeout(startGame, 100);
    return () => clearTimeout(t);
  }, [player1, player2, startGame]);

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
        if (keys.has('s') && !keys.has('a') && !keys.has('d')) p1.vy = 4;
        // P = Block
        if (keys.has('p')) {
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
                    // L = Jump (quick hop)
                    if (keys.has('l') && !p1.isAttacking && p1.canAct) {
                      p1.vy = -6.5;
                    }
                    // S+U = Finisher 1 (hold S, press U)
                    if (keys.has('s') && keys.has('u') && !p1.isAttacking && p1.canAct && p1.specialCooldown <= 0) {
                      p1.isAttacking = true;
                      p1.attackType = 'ultimate';
                      p1.attackTimer = 55;
                      p1.canAct = false;
                      p1.combo = 0;
                      p1.specialCooldown = 300;
                      p1.blastCooldown = 300;
                      if (p1.chargeAmount > 0) {
                        p1.chargedAttack = true;
                        p1.chargeAmount = 0;
                      }
                    }
                    // U = Super (ranged energy blast)
                    else if (keys.has('u') && !p1.isAttacking && p1.canAct && p1.blastCooldown <= 0) {
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
                    // S+I = Finisher 2
                    if (keys.has('s') && keys.has('i') && !p1.isAttacking && p1.canAct && p1.specialCooldown <= 0) {
                      p1.isAttacking = true;
                      p1.attackType = 'ultimate';
                      p1.attackTimer = 60;
                      p1.canAct = false;
                      p1.combo = 0;
                      p1.specialCooldown = 300;
                      p1.slamCooldown = 300;
                      if (p1.chargeAmount > 0) {
                        p1.chargedAttack = true;
                        p1.chargeAmount = 0;
                      }
                    }
                    // I = Ultra (ground slam AOE)
                    else if (keys.has('i') && !p1.isAttacking && p1.canAct && p1.slamCooldown <= 0) {
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
                    // S+O = Transform (S and O together — owner's scheme)
                    if (keys.has('s') && keys.has('o') && !p1.isAttacking && p1.canAct && p1.specialCooldown <= 0) {
                      p1.isAttacking = true;
                      p1.attackType = 'ultimate';
                      p1.attackTimer = 50;
                      p1.canAct = false;
                      p1.combo = 0;
                      p1.specialCooldown = 300;
                      if (p1.chargeAmount > 0) {
                        p1.chargedAttack = true;
                        p1.chargeAmount = 0;
                      }
                    }
                    // O alone = also Transform (backward compatible)
                    else if (keys.has('o') && !p1.isAttacking && p1.canAct && p1.specialCooldown <= 0) {
                      p1.isAttacking = true;
                      p1.attackType = 'ultimate';
                      p1.attackTimer = 50;
                      p1.canAct = false;
                      p1.combo = 0;
                      p1.specialCooldown = 300;
                      if (p1.chargeAmount > 0) {
                        p1.chargedAttack = true;
                        p1.chargeAmount = 0;
                      }
                    }
                    // S+K = Finisher (character's own signature finisher)
                    if (keys.has('s') && keys.has('k') && !p1.isAttacking && p1.canAct && p1.specialCooldown <= 0) {
                      p1.isAttacking = true;
                      p1.attackType = 'ultimate';
                      p1.finisherTypeActive = p1.finisherType;
                      p1.attackTimer = 70;
                      p1.canAct = false;
                      p1.combo = 0;
                      p1.specialCooldown = 300;
                      p1.chargeAmount = 0;
                      if (gameRef.current) {
                        gameRef.current.announcer = (p1.finisher || 'FINISHER').toUpperCase() + '!';
                        gameRef.current.announcerTimer = 80;
                      }
                    }
                    // N = Finisher 1 (first signature move)
                    if (keys.has('n') && !p1.isAttacking && p1.canAct && p1.specialCooldown <= 0) {
                      p1.isAttacking = true;
                      p1.attackType = 'ultimate';
                      p1.finisherTypeActive = p1.finisherType;
                      p1.attackTimer = 70;
                      p1.canAct = false;
                      p1.combo = 0;
                      p1.specialCooldown = 300;
                      p1.chargeAmount = 0;
                      if (gameRef.current) {
                        gameRef.current.announcer = (p1.finisher || 'FINISHER').toUpperCase() + '!';
                        gameRef.current.announcerTimer = 80;
                      }
                    }
                    // M = Finisher 2 (second signature move)
                    if (keys.has('m') && !p1.isAttacking && p1.canAct && p1.specialCooldown <= 0) {
                      p1.isAttacking = true;
                      p1.attackType = 'ultimate';
                      p1.finisherTypeActive = p1.finisherType2;
                      p1.attackTimer = 70;
                      p1.canAct = false;
                      p1.combo = 0;
                      p1.specialCooldown = 300;
                      p1.chargeAmount = 0;
                      if (gameRef.current) {
                        gameRef.current.announcer = (p1.finisher2 || p1.finisher || 'FINISHER').toUpperCase() + '!';
                        gameRef.current.announcerTimer = 80;
                      }
                    }
                    // , = Finisher 3 (third signature move)
                    if (keys.has(',') && !p1.isAttacking && p1.canAct && p1.specialCooldown <= 0) {
                      p1.isAttacking = true;
                      p1.attackType = 'ultimate';
                      p1.finisherTypeActive = p1.finisherType3;
                      p1.attackTimer = 70;
                      p1.canAct = false;
                      p1.combo = 0;
                      p1.specialCooldown = 300;
                      p1.chargeAmount = 0;
                      if (gameRef.current) {
                        gameRef.current.announcer = (p1.finisher3 || p1.finisher || 'FINISHER').toUpperCase() + '!';
                        gameRef.current.announcerTimer = 80;
                      }
                    }
                    // . = Finisher 4 (fourth signature move)
                    if (keys.has('.') && !p1.isAttacking && p1.canAct && p1.specialCooldown <= 0) {
                      p1.isAttacking = true;
                      p1.attackType = 'ultimate';
                      p1.finisherTypeActive = p1.finisherType4;
                      p1.attackTimer = 70;
                      p1.canAct = false;
                      p1.combo = 0;
                      p1.specialCooldown = 300;
                      p1.chargeAmount = 0;
                      if (gameRef.current) {
                        gameRef.current.announcer = (p1.finisher4 || p1.finisher || 'FINISHER').toUpperCase() + '!';
                        gameRef.current.announcerTimer = 80;
                      }
                    }
                    // ; = Grab (throw)
                    if (keys.has(';') && !p1.isAttacking && p1.canAct) {
                      const gDist = Math.abs(p2.x - p1.x);
                      if (gDist < 85 && Math.abs(p2.y - p1.y) < 65) {
                        p1.isAttacking = true;
                        p1.attackType = 'grab';
                        p1.attackTimer = 45;
                        p1.canAct = false;
                        p2.isGrabbed = true;
                        p2.canAct = false;
                        p2.grabHit = false;
                        p2.vx = 0;
                        p2.vy = 0;
                        if (gameRef.current) {
                          gameRef.current.announcer = 'GRAB!';
                          gameRef.current.announcerTimer = 40;
                        }
                      }
                    }
                    // E = Kiss (power drain — Rogue, Poison Ivy)
                    if (keys.has('e') && !p1.isAttacking && p1.canAct && p1.kissDrain && p1.specialCooldown <= 0) {
                      const kDist = Math.abs(p2.x - p1.x);
                      if (kDist < 95 && Math.abs(p2.y - p1.y) < 70) {
                        p1.isAttacking = true;
                        p1.attackType = 'kiss';
                        p1.attackTimer = 44;
                        p1.canAct = false;
                        p1.specialCooldown = 300;
                        p2.isKissed = true;
                        p2.canAct = false;
                        p2.vx = 0;
                        p2.vy = 0;
                        if (p1.kissPoison) {
                          p2.poisoned = 150;
                          if (gameRef.current) {
                            gameRef.current.announcer = 'TOXIC KISS! POISONED!';
                            gameRef.current.announcerTimer = 60;
                          }
                        }
                        if (gameRef.current && !p1.kissPoison) {
                          gameRef.current.announcer = (p1.kissName || 'KISS').toUpperCase() + '!';
                          gameRef.current.announcerTimer = 50;
                        }
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
          if (roll < 0.25 && p2.combo >= 3) {
                          p2.isAttacking = true;
                          p2.attackType = 'ultimate';
                          p2.attackTimer = 50;
                          p2.canAct = false;
                          p2.combo = 0;
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
        else if (attacker.attackType === 'slam') reach = 140;
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

        if (p2.isBlocking) {
            dmg = Math.floor(dmg * 0.3);
            playSfx('block');
          } else {
            // Play attack SFX based on type
            const sfxType = p1.attackType as any;
            playSfx(sfxType || 'punch');
          }

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

        if (p1.isBlocking) {
            dmg = Math.floor(dmg * 0.3);
            playSfx('block');
          } else {
            const sfxType = p2.attackType as any;
            playSfx(sfxType || 'punch');
          }

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

      // Grab mechanics: grabbed fighter sticks to the grabber, thrown at the peak
      if (p2.isGrabbed) {
        if (p1.attackType === 'grab' && !p2.grabHit) {
          p2.x = p1.x + p1.facing * 52;
          p2.y = p1.y;
          p2.vx = 0;
          p2.vy = 0;
        }
        if (p1.attackTimer === 16 && !p2.grabHit) {
          p2.grabHit = true;
          p2.hp -= 25;
          p2.hitTimer = 12;
          p2.vx = p1.facing * 6;
          p2.vy = -7;
          if (gameRef.current) {
            gameRef.current.announcer = (p1.finisher || 'THROW').toUpperCase() + '!';
            gameRef.current.announcerTimer = 40;
          }
        }
        if (p1.attackType !== 'grab') {
          p2.isGrabbed = false;
          p2.canAct = true;
        }
      }

      // Kiss mechanics: victim locked close, HP + charge drained, attacker heals
      if (p2.isKissed) {
        if (p1.attackType === 'kiss') {
          p2.x = p1.x + p1.facing * 46;
          p2.y = p1.y + Math.sin(p1.attackTimer * 0.3) * 2;
          p2.vx = 0;
          p2.vy = 0;
          if (p1.attackTimer % 7 === 0 && p1.attackTimer > 0) {
            p2.hp -= 5;
            p1.hp = Math.min(100, p1.hp + 3);
            p2.chargeAmount = 0;
            p1.chargeAmount = Math.min(100, p1.chargeAmount + 15);
            p2.hitTimer = 8;
            if (gameRef.current) {
              gameRef.current.announcer = (p1.kissName || 'KISS').toUpperCase() + '!';
              gameRef.current.announcerTimer = 45;
            }
            if (p2.hp <= 0 && game.phase === 'fight') {
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
        } else {
          p2.isKissed = false;
          p2.canAct = true;
        }
      }

      // Poison damage over time (Ivy's Toxic Kiss)
      if (p2.poisoned > 0 && game.phase === 'fight') {
        p2.poisoned--;
        if (p2.poisoned % 15 === 0 && p2.poisoned > 0) {
          p2.hp -= 2;
          p2.hitTimer = 4;
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
    drawFighter(ctx, p1, p1.color, p2);
    drawFighter(ctx, p2, p2.color, p1);

    ctx.restore();
  }

  function drawFighter(
    ctx: CanvasRenderingContext2D,
    f: FighterState,
    color: string,
    opp: FighterState
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

    const portraitImg = getLoadedPortrait(f);
    if (portraitImg) {
      // ── Portrait rendering: real character art as the fighter body ──
      ctx.save();
      if (f.facing === -1) {
        ctx.translate(cx + w, cy);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(portraitImg, f.facing === -1 ? 0 : cx, f.facing === -1 ? 0 : cy, w, h);
      ctx.restore();
      ctx.shadowBlur = 0;
      // Hit flash overlay (keeps damage feedback readable over the art)
      if (f.hitTimer > 0 && f.hitTimer % 4 < 2) {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(cx, cy, w, h);
      }
      // Blocking tint
      if (f.isBlocking) {
        ctx.fillStyle = 'rgba(59,130,246,0.25)';
        ctx.fillRect(cx, cy, w, h);
      }
    } else {
      // ── Fallback: rectangle fighter (no portrait loaded) ──
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
    }

    // Arms (rectangle arms only in fallback mode — portraits are the full body)
    const armSwing = f.isAttacking
      ? Math.sin(f.attackTimer * 0.8) * 20
      : 0;
    ctx.fillStyle = '#ffccaa';
    ctx.shadowBlur = 0;

    if (f.isAttacking && !portraitImg) {
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
                  const finColor = f.finisherColor || '#facc15';
                  const ft = f.finisherTypeActive || f.finisherType || 'nova';
                  const dirF = f.facing;
                  const bx = cx + w / 2;
                  const by = cy + 36;
                  const t = Math.max(0, 50 - f.attackTimer);
                  // BEAM - energy column blasts across the screen
                  if (ft === 'beam') {
                    const grow = t * 1.6;
                    ctx.globalAlpha = 0.4; ctx.fillStyle = finColor; ctx.shadowColor = finColor; ctx.shadowBlur = 40;
                    ctx.fillRect(dirF === 1 ? bx : bx - grow, by - 16, grow, 32);
                    ctx.globalAlpha = 0.85; ctx.fillStyle = '#ffffff';
                    ctx.fillRect(dirF === 1 ? bx : bx - grow, by - 8, grow, 16);
                    ctx.beginPath(); ctx.arc(dirF === 1 ? bx + grow : bx - grow, by, 18 + t * 0.3, 0, Math.PI * 2); ctx.fill();
                    ctx.globalAlpha = 0.6; ctx.fillStyle = finColor;
                    for (let i = 0; i < 6; i++) {
                      const px = dirF === 1 ? bx + grow * 0.4 + i * 14 : bx - grow * 0.4 - i * 14;
                      const py = by - 24 + (i % 3) * 16;
                      ctx.fillRect(px, py, 9, 9);
                    }
                    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
                  } else if (ft === 'rush') {
                    // RUSH - afterimage dash flurry
                    for (let i = 0; i < 6; i++) {
                      const pr = Math.min(1, Math.max(0, (t - i * 5) / 30));
                      if (pr <= 0) continue;
                      const gx = bx + dirF * pr * 170;
                      const gy = by - pr * 46;
                      ctx.globalAlpha = 0.6 - pr * 0.45;
                      ctx.fillStyle = finColor; ctx.shadowColor = finColor; ctx.shadowBlur = 25;
                      ctx.fillRect(gx - 13, gy - 22, 26, 42);
                    }
                    ctx.globalAlpha = 0.9; ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 0;
                    for (let i = 0; i < 5; i++) {
                      const a = (i / 5) * Math.PI * 2 + t * 0.5;
                      ctx.beginPath(); ctx.arc(bx + dirF * 170 + Math.cos(a) * 14, by - 30 + Math.sin(a) * 14, 5 + t * 0.15, 0, Math.PI * 2); ctx.fill();
                    }
                    ctx.globalAlpha = 1;
                  } else if (ft === 'slam') {
                    // SLAM - leap up, slam down, ground shockwave
                    const rise = Math.max(0, 26 - t);
                    const sy = by - rise;
                    ctx.globalAlpha = 0.8; ctx.fillStyle = finColor; ctx.shadowColor = finColor; ctx.shadowBlur = 30;
                    ctx.fillRect(bx - 9, sy - 42, 18, 84);
                    for (let i = 0; i < 3; i++) {
                      const r = Math.max(0, (t - i * 7)) * 3.2;
                      ctx.globalAlpha = 0.5 - i * 0.13;
                      ctx.strokeStyle = finColor; ctx.lineWidth = 6;
                      ctx.beginPath(); ctx.arc(bx, cy + h - 6, r, 0, Math.PI * 2); ctx.stroke();
                    }
                    ctx.globalAlpha = 0.7; ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 0;
                    ctx.beginPath(); ctx.arc(bx, cy + h - 6, 12 + t * 0.6, 0, Math.PI * 2); ctx.fill();
                    ctx.globalAlpha = 1;
                  } else if (ft === 'cyclone') {
                    // CYCLONE - spinning energy vortex
                    ctx.globalAlpha = 0.55; ctx.fillStyle = finColor; ctx.shadowColor = finColor; ctx.shadowBlur = 30;
                    for (let i = 0; i < 9; i++) {
                      const a = (i / 9) * Math.PI * 2 + t * 0.45;
                      const r = 18 + t * (0.5 + 0.5 * Math.abs(Math.sin(i * 1.7)));
                      ctx.beginPath(); ctx.arc(bx + Math.cos(a) * r, by + Math.sin(a) * r, 9 + t * 0.2, 0, Math.PI * 2); ctx.fill();
                    }
                    ctx.globalAlpha = 0.9; ctx.fillStyle = '#ffffff';
                    ctx.beginPath(); ctx.arc(bx, by, 12 + t * 0.15, 0, Math.PI * 2); ctx.fill();
                    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
                  } else {
                  // NOVA - full explosion
                  ctx.fillStyle = finColor;
                  ctx.shadowColor = finColor;
                  ctx.shadowBlur = 30;
                  ctx.globalAlpha = 0.5;
                  // Outer blast - finisher color
                  ctx.beginPath();
                  ctx.arc(
                    cx + w / 2,
                    cy + 36,
                    40 + (50 - f.attackTimer) * 1.5,
                    0,
                    Math.PI * 2
                  );
                  ctx.fill();
                  // Inner blast - bright finisher color
                  ctx.fillStyle = finColor;
                  ctx.shadowColor = finColor;
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
                }
    } else {
      // Normal arm position
      ctx.fillRect(cx + 5, cy + 32, 10, 6);
      ctx.fillRect(cx + w - 15, cy + 32, 10, 6);
    }
      // Grab: glowing extended arm
      if (f.attackType === 'grab') {
        ctx.fillStyle = '#fde68a';
        ctx.shadowColor = '#fde68a';
        ctx.shadowBlur = 18;
        ctx.fillRect(f.facing === 1 ? cx + w - 10 : cx + 6, cy + 28, 30, 9);
        ctx.shadowBlur = 0;
      }
      // Grabbed: pulsing lock ring
      if (f.isGrabbed) {
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#f87171';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(cx + w / 2, cy + 32, 36 + Math.sin(f.attackTimer * 0.3) * 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      // Kiss: heart + power-drain stream
      if (f.attackType === 'kiss') {
        const sx = cx + w / 2;
        const sy = cy + 30;
        const tx = opp.x + opp.width / 2;
        const ty = opp.y + 30;
        const kc = f.finisherColor || '#f472b6';
        ctx.globalAlpha = 0.9;
        for (let i = 0; i < 6; i++) {
          const ph = (f.attackTimer * 0.05 + i / 6) % 1;
          const px = sx + (tx - sx) * ph;
          const py = sy + (ty - sy) * ph + Math.sin(ph * 9) * 5;
          ctx.fillStyle = i % 2 ? '#f472b6' : kc;
          ctx.beginPath();
          ctx.arc(px, py, 2.5 + (1 - ph) * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#fb7185';
        ctx.shadowColor = '#fb7185';
        ctx.shadowBlur = 12;
        const hx = sx + f.facing * 26;
        const hy = sy - 6;
        ctx.beginPath();
        ctx.arc(hx - 5, hy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(hx + 5, hy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(hx - 9, hy + 2);
        ctx.lineTo(hx + 9, hy + 2);
        ctx.lineTo(hx, hy + 14);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
      // Poisoned: green bubbling aura
      if (f.poisoned > 0) {
        ctx.globalAlpha = 0.75;
        for (let i = 0; i < 4; i++) {
          const pa = (f.poisoned * 0.2 + i * 1.7) % (Math.PI * 2);
          const pr = 20 + Math.sin(f.poisoned * 0.15 + i * 2) * 7;
          ctx.fillStyle = i % 2 ? '#22c55e' : '#84cc16';
          ctx.beginPath();
          ctx.arc(cx + w / 2 + Math.cos(pa) * pr, cy + h * 0.5 + Math.sin(pa) * pr, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
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
    // Mount the canvas first (the result screen has none), then start —
    // startGame needs canvasRef.current for the arena dimensions.
    setGamePhase('vs');
    setTimeout(startGame, 100);
  };

  const resetSelection = () => {
    setPlayer1(null);
    setPlayer2(null);
    setSelectingFor('p1');
    setSearch('');
    setCategory('All');
    setVisibleCount(60);
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
          <TouchControls keysRef={keysRef} />
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
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <CharacterFig cat={player1.category} size={104} name={player1.name} />
                  </div>
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
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <CharacterFig cat={player2.category} size={104} name={player2.name} />
                  </div>
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
            <button
              onClick={() => setFemaleOnly((v) => !v)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                femaleOnly
                  ? 'bg-pink-500 text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              ♀ Female
            </button>
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

          {/* Character count */}
          <p className="text-center text-xs text-gray-500 mb-3">
            Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} fighters
          </p>

          {/* Character grid — windowed for performance */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {filtered.slice(0, visibleCount).map((char) => (
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
                <div className="aspect-[3/4] w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 to-black">
                  <CharacterFig cat={char.category} size={112} name={char.name} />
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

          {/* Load More button */}
          {visibleCount < filtered.length && (
            <div className="text-center mt-6 mb-8">
              <button
                onClick={() => setVisibleCount((prev) => prev + 60)}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all"
              >
                Load More ({filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}

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
                WASD: Move | J: Punch | K: Kick | L: Jump | U: Super | I: Ultra | S+O: Transform | O/S+U/S+I: Super | N/M/,/.: Finishers | ;: Grab | E: Kiss (drain) | P: Block | Enter: Charge
              </p>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`mt-2 px-4 py-1 rounded-full text-xs font-bold transition-all ${isMuted ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}
              >
                {isMuted ? '🔇 Sound OFF' : '🔊 Sound ON'}
              </button>
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
          <p>WASD: Move | J: Punch | K: Kick | L: Jump | U: Super | I: Ultra | S+O: Transform | O/S+U/S+I: Super | N/M/,/.: Finishers | ;: Grab | E: Kiss (drain) | P: Block | Enter: Charge</p>
          <div className="mt-2 flex gap-2 justify-center flex-wrap items-center">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${isMuted ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}
            >
              {isMuted ? '🔇 Muted' : '🔊 Sound'}
            </button>
            {([['auto', '🎵 Auto'], ['kmix', '🎧 K-Pop'], ['ten', '10-Min'], ['toku', 'Toku'], ['anime', 'Anime'], ['wrestling', 'WWE/AEW'], ['cartoon', 'Cartoon']] as const).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setMusicChoice(v)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  musicChoice === v ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <TouchControls keysRef={keysRef} />
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
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <CharacterFig cat={player1.category} size={150} name={player1.name} />
                  </div>
                </div>
                <p className="text-lg font-bold mt-2 text-red-400">
                  {player1.name}
                </p>
              </div>
              <div className="text-4xl font-black text-gray-600">VS</div>
              <div className="text-center">
                <div className="w-32 h-44 rounded-xl overflow-hidden border-4 border-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <CharacterFig cat={player2.category} size={150} name={player2.name} />
                  </div>
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