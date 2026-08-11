'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { characters, Character } from '@/data/characters';

const CATEGORIES = ['All', 'Anime', 'Cartoon', 'WWE', 'AEW', 'Toku', 'Video Games'] as const;

export default function Home() {
  const [player1, setPlayer1] = useState<Character | null>(null);
  const [player2, setPlayer2] = useState<Character | null>(null);
  const [selectingFor, setSelectingFor] = useState<'p1' | 'p2'>('p1');
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [showSelect, setShowSelect] = useState(true);
  const [visibleCount, setVisibleCount] = useState(60);
  const router = useRouter();

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(60);
  }, [category, search]);

  const filtered = useMemo(() => {
    let list = characters;
    if (category !== 'All') list = list.filter(c => c.category === category);
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [category, search]);

  const handleSelect = (char: Character) => {
    if (selectingFor === 'p1') {
      setPlayer1(char);
      setSelectingFor('p2');
    } else {
      setPlayer2(char);
      setSelectingFor('p1');
    }
  };

  const startMatch = () => {
    if (player1 && player2) {
      router.push(`/fight?p1=${player1.id}&p2=${player2.id}`);
    }
  };

  const resetSelection = () => {
    setPlayer1(null);
    setPlayer2(null);
    setSelectingFor('p1');
    setShowSelect(true);
  };
  const goFight = (a: Character, b: Character) => {
    router.push(`/fight?p1=${a.id}&p2=${b.id}`);
  };
  const surpriseMatch = () => {
    const cats = ['Anime', 'Cartoon', 'WWE', 'AEW', 'Toku', 'Video Games'];
    const c1 = cats[Math.floor(Math.random() * cats.length)];
    let c2 = cats[Math.floor(Math.random() * cats.length)];
    if (c2 === c1) c2 = cats[(cats.indexOf(c1) + 1 + Math.floor(Math.random() * (cats.length - 1))) % cats.length];
    const a = characters.filter(c => c.category === c1);
    const b = characters.filter(c => c.category === c2);
    if (a.length && b.length) goFight(a[Math.floor(Math.random() * a.length)], b[Math.floor(Math.random() * b.length)]);
  };
  const featuredA = characters.find(c => c.name === 'Goku') || characters[0];
  const featuredB = characters.find(c => c.name.toLowerCase().includes('undertaker')) || characters.find(c => c.category === 'WWE') || characters[1];

  // VS Screen
  if (!showSelect && player1 && player2) {
    return (
      <main className="min-h-screen bg-gray-900 text-white">
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <div className="flex items-center gap-8 md:gap-16 mb-12">
            <div className="text-center">
              <div className="w-48 h-64 md:w-64 md:h-80 rounded-2xl overflow-hidden border-4 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                <img src={player1.imageUrl} alt={player1.name} className="w-full h-full object-cover" decoding="async" />
              </div>
              <h2 className="text-2xl font-black mt-4 text-red-400">{player1.name}</h2>
              <p className="text-gray-500 text-sm">{player1.universe}</p>
            </div>
            <div className="text-7xl font-black italic text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">VS</div>
            <div className="text-center">
              <div className="w-48 h-64 md:w-64 md:h-80 rounded-2xl overflow-hidden border-4 border-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                <img src={player2.imageUrl} alt={player2.name} className="w-full h-full object-cover" decoding="async" />
              </div>
              <h2 className="text-2xl font-black mt-4 text-blue-400">{player2.name}</h2>
              <p className="text-gray-500 text-sm">{player2.universe}</p>
            </div>
          </div>
          <button onClick={startMatch} className="bg-gradient-to-r from-red-600 to-yellow-500 text-white py-4 px-16 rounded-full font-black text-2xl tracking-widest hover:scale-110 transition-all shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-pulse">
            ⚔️ FIGHT! ⚔️
          </button>
          <button onClick={resetSelection} className="mt-6 text-gray-500 hover:text-white underline text-sm">← Change Fighters</button>
        </div>
      </main>
    );
  }

  // Character Select Screen
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 border-b border-gray-700 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
              🎮 DREAM MATCHES
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-400">
                {player1 ? `P1: ${player1.name}` : 'Select P1'} | {player2 ? `P2: ${player2.name}` : 'Select P2'}
              </span>
            </div>
          </div>
          {/* Category Tabs */}
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${category === cat ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                {cat} {cat === 'All' ? `(${characters.length})` : `(${characters.filter(c => c.category === cat).length})`}
              </button>
            ))}
          </div>
          {/* Search */}
          <input type="text" placeholder="🔍 Search fighters..." value={search} onChange={e => setSearch(e.target.value)}
            className="mt-3 w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500" />
        </div>
      </div>

      {/* Featured Dream Match — the action, front and center */}
      <div className="bg-gradient-to-b from-gray-900 via-red-950/30 to-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500 mb-2">⚡ The Dream Match Arena ⚡</p>
          <h2 className="text-3xl md:text-5xl font-black italic text-white mb-6">WATCH LEGENDS CLASH — INSTANTLY</h2>
          <div className="flex items-center justify-center gap-4 md:gap-10 mb-8">
            <div className="text-center">
              <img src={featuredA.imageUrl} alt={featuredA.name} className="w-24 h-36 md:w-32 md:h-48 rounded-xl border-4 border-red-600 shadow-[0_0_25px_rgba(220,38,38,0.5)] object-cover" />
              <p className="mt-2 text-red-400 font-bold text-sm">{featuredA.name}</p>
              <p className="text-[10px] text-gray-500">{featuredA.universe}</p>
            </div>
            <div className="text-5xl md:text-7xl font-black italic text-yellow-500 drop-shadow-[0_0_12px_rgba(234,179,8,0.5)]">VS</div>
            <div className="text-center">
              <img src={featuredB.imageUrl} alt={featuredB.name} className="w-24 h-36 md:w-32 md:h-48 rounded-xl border-4 border-blue-600 shadow-[0_0_25px_rgba(59,130,246,0.5)] object-cover" />
              <p className="mt-2 text-blue-400 font-bold text-sm">{featuredB.name}</p>
              <p className="text-[10px] text-gray-500">{featuredB.universe}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => goFight(featuredA, featuredB)} className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-10 py-4 rounded-full font-black text-xl tracking-wider hover:scale-105 transition-all shadow-[0_0_30px_rgba(220,38,38,0.5)]">
              ▶ WATCH THIS MATCH
            </button>
            <button onClick={surpriseMatch} className="bg-gray-800 hover:bg-gray-700 text-yellow-400 px-10 py-4 rounded-full font-black text-xl tracking-wider hover:scale-105 transition-all border border-yellow-600/40">
              🎲 SURPRISE ME
            </button>
          </div>
          <p className="mt-6 text-xs text-gray-500">1,920+ fighters · Anime vs Cartoons · WWE vs AEW · Toku vs Toku — or build your own below ↓</p>
        </div>
      </div>

      {/* AI Demo Fight Video */}
      <div className="bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="inline-block bg-red-600/20 text-red-400 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1 rounded-full mb-4">🤖 AI Prototype</div>
          <h2 className="text-2xl md:text-3xl font-black italic text-white mb-2">SEE THE FUTURE: AI-Generated Dream Matches</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-xl mx-auto">This 5-second clip was generated frame-by-frame using AI image generation — a preview of fully animated dream match videos coming soon.</p>
          <div className="relative mx-auto max-w-2xl rounded-2xl overflow-hidden border-2 border-yellow-600/50 shadow-[0_0_40px_rgba(234,179,8,0.2)]">
            <img 
              src="/videos/demo-fight.gif" 
              alt="AI-Generated Dream Match Fight Demo" 
              className="w-full h-auto"
              style={{ imageRendering: 'auto' }}
            />
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded">
              AI PROTOTYPE • 5s
            </div>
          </div>
          <p className="mt-4 text-[11px] text-gray-600">Spiky-haired anime warrior vs dark shadow figure — AI prototype using keyframe generation</p>
        </div>
      </div>

      {/* Selected Fighters Bar */}
      {(player1 || player2) && (
        <div className="bg-gray-800/80 border-b border-gray-700 p-3 flex items-center justify-center gap-4">
          <div className="flex items-center gap-3">
            {player1 && <span className="text-red-400 font-bold text-sm">{player1.name}</span>}
            <span className="text-yellow-500 font-black">VS</span>
            {player2 && <span className="text-blue-400 font-bold text-sm">{player2.name}</span>}
          </div>
          {player1 && player2 && (
            <button onClick={() => setShowSelect(false)} className="bg-red-600 hover:bg-red-500 text-white px-6 py-1.5 rounded-full font-bold text-sm ml-4">
              CONFIRM MATCH
            </button>
          )}
        </div>
      )}

      {/* Character Grid — Game Style */}
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500 font-bold">
              {selectingFor === 'p1' ? '🎮 SELECT FIGHTER 1' : '🎮 SELECT FIGHTER 2'}
            </p>
            <p className="text-xs text-gray-600">
              Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} fighters
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
            {filtered.slice(0, visibleCount).map(char => {
              const isP1 = player1?.id === char.id;
              const isP2 = player2?.id === char.id;
              const isSelected = isP1 || isP2;
              return (
                <div key={char.id} onClick={() => !isSelected && handleSelect(char)}
                  className={`group relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-yellow-400 scale-105 z-10' : 'hover:ring-2 hover:ring-white/50 hover:scale-105'
                  } ${isP1 ? 'ring-red-500' : isP2 ? 'ring-blue-500' : ''}`}>
                  <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-1.5">
                    <p className="text-[10px] font-bold truncate leading-tight">{char.name}</p>
                    <p className="text-[8px] text-gray-400 truncate">{char.universe}</p>
                  </div>
                  {isP1 && <div className="absolute top-1 left-1 bg-red-600 text-[8px] font-black px-1 rounded">P1</div>}
                  {isP2 && <div className="absolute top-1 left-1 bg-blue-600 text-[8px] font-black px-1 rounded">P2</div>}
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <p className="text-2xl mb-2">🔍</p>
              <p>No fighters found matching "{search}"</p>
            </div>
          )}
          {visibleCount < filtered.length && (
            <div className="text-center mt-6 mb-8">
              <button
                onClick={() => setVisibleCount(prev => prev + 60)}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all"
              >
                Load More ({filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}