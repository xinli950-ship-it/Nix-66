'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { characters, Character } from '@/data/characters';

const CATEGORIES = ['All', 'Anime', 'Cartoon', 'WWE', 'AEW', 'Toku'] as const;

export default function Home() {
  const [player1, setPlayer1] = useState<Character | null>(null);
  const [player2, setPlayer2] = useState<Character | null>(null);
  const [selectingFor, setSelectingFor] = useState<'p1' | 'p2'>('p1');
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [showSelect, setShowSelect] = useState(true);
  const router = useRouter();

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

  // VS Screen
  if (!showSelect && player1 && player2) {
    return (
      <main className="min-h-screen bg-gray-900 text-white">
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <div className="flex items-center gap-8 md:gap-16 mb-12">
            <div className="text-center">
              <div className="w-48 h-64 md:w-64 md:h-80 rounded-2xl overflow-hidden border-4 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                <img src={player1.imageUrl} alt={player1.name} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-2xl font-black mt-4 text-red-400">{player1.name}</h2>
              <p className="text-gray-500 text-sm">{player1.universe}</p>
            </div>
            <div className="text-7xl font-black italic text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">VS</div>
            <div className="text-center">
              <div className="w-48 h-64 md:w-64 md:h-80 rounded-2xl overflow-hidden border-4 border-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                <img src={player2.imageUrl} alt={player2.name} className="w-full h-full object-cover" />
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
            <p className="text-xs text-gray-600">{filtered.length} fighters</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
            {filtered.map(char => {
              const isP1 = player1?.id === char.id;
              const isP2 = player2?.id === char.id;
              const isSelected = isP1 || isP2;
              return (
                <div key={char.id} onClick={() => !isSelected && handleSelect(char)}
                  className={`group relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-yellow-400 scale-105 z-10' : 'hover:ring-2 hover:ring-white/50 hover:scale-105'
                  } ${isP1 ? 'ring-red-500' : isP2 ? 'ring-blue-500' : ''}`}>
                  <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" loading="lazy" />
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
        </div>
      </div>
    </main>
  );
}