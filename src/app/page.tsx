'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { characters, Character } from '@/data/characters';
import CharacterCard from '@/components/CharacterCard';
import SuggestMatch from '@/components/SuggestMatch';
import { Storyline } from '@/lib/storylines';

export default function Home() {
  const [player1, setPlayer1] = useState<Character | null>(null);
  const [player2, setPlayer2] = useState<Character | null>(null);
  const [selectingFor, setSelectingFor] = useState<1 | 2>(1);
  const [storyMode, setStoryMode] = useState(false);
  const [storylines, setStorylines] = useState<Storyline[]>([]);
  const [selectedStoryline, setSelectedStoryline] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    fetch('/api/storylines')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStorylines(data);
          if (data.length > 0) setSelectedStoryline(data[0].id);
        }
      })
      .catch(err => console.error('Error fetching storylines:', err));
  }, []);

  const handleSelect = (character: Character) => {
    if (selectingFor === 1) {
      setPlayer1(character);
      setSelectingFor(2);
    } else {
      setPlayer2(character);
      setSelectingFor(1);
    }
  };

  const startMatch = async () => {
    if (player1 && player2) {
      try {
        const response = await fetch('/api/match/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            player1Id: player1.id, 
            player2Id: player2.id,
            storylineId: storyMode ? selectedStoryline : null
          }),
        });
        const data = await response.json();
        if (data.matchId) {
          router.push(`/match/${data.matchId}`);
        } else {
          alert('Failed to generate match');
        }
      } catch (error) {
        console.error('Error starting match:', error);
        alert('An error occurred while starting the match');
      }
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 pt-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
            DREAM MATCHES
          </h1>
          <p className="text-xl text-gray-400">Battle across universes with AI-generated videos</p>
        </header>

        {/* Featured Match Request */}
        <section className="mb-12 bg-gradient-to-r from-blue-900/40 to-red-900/40 p-1 rounded-2xl">
          <div className="bg-gray-900/90 rounded-[calc(1rem-1px)] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded uppercase mb-2 inline-block">Featured Request</span>
              <h2 className="text-2xl font-bold italic">The Elite (AEW) vs. The Bloodline (WWE)</h2>
              <p className="text-gray-400">The ultimate wrestling crossover fans have been waiting for!</p>
            </div>
            <button 
              onClick={() => {
                const elite = characters.find(c => c.name === 'Kenny Omega');
                const bloodline = characters.find(c => c.name === 'Roman Reigns');
                if (elite && bloodline) {
                  setPlayer1(elite);
                  setPlayer2(bloodline);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              Load Matchup
            </button>
          </div>
        </section>

        {/* Matchup Selection Area */}
        <div className="mb-16 bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-bold mb-4 text-red-400">Fighter 1</h2>
              {player1 ? (
                <div className="w-48">
                  <CharacterCard 
                    character={player1} 
                    onSelect={() => setSelectingFor(1)} 
                    selected={selectingFor === 1}
                  />
                </div>
              ) : (
                <div 
                  className={`w-48 aspect-[2/3] border-4 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${selectingFor === 1 ? 'border-yellow-400 bg-gray-700' : 'border-gray-600 hover:border-gray-500'}`}
                  onClick={() => setSelectingFor(1)}
                >
                  <span className="text-gray-400">Select Fighter 1</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center justify-center gap-4 flex-1">
              <div className="text-6xl font-black italic text-gray-700">VS</div>
              
              {/* Story Mode Toggle */}
              <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 w-full max-w-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-sm text-gray-300 uppercase tracking-wider">Story Mode</span>
                  <button 
                    onClick={() => setStoryMode(!storyMode)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${storyMode ? 'bg-yellow-500' : 'bg-gray-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${storyMode ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
                
                {storyMode && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Select Storyline</label>
                    <select 
                      value={selectedStoryline}
                      onChange={(e) => setSelectedStoryline(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-sm focus:outline-none focus:border-yellow-500"
                    >
                      {storylines.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                    {selectedStoryline && (
                      <p className="mt-2 text-xs text-gray-400 italic line-clamp-2">
                        {storylines.find(s => s.id === selectedStoryline)?.description}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={startMatch}
                disabled={!player1 || !player2}
                className={`w-full max-w-sm py-4 rounded-full font-bold text-xl transition-all ${
                  player1 && player2 
                  ? 'bg-red-600 hover:bg-red-500 hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.5)]' 
                  : 'bg-gray-700 cursor-not-allowed opacity-50'
                }`}
              >
                GENERATE MATCH
              </button>
            </div>

            <div className="flex flex-col items-center">
              <h2 className="text-xl font-bold mb-4 text-blue-400">Fighter 2</h2>
              {player2 ? (
                <div className="w-48">
                  <CharacterCard 
                    character={player2} 
                    onSelect={() => setSelectingFor(2)} 
                    selected={selectingFor === 2}
                  />
                </div>
              ) : (
                <div 
                  className={`w-48 aspect-[2/3] border-4 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${selectingFor === 2 ? 'border-yellow-400 bg-gray-700' : 'border-gray-600 hover:border-gray-500'}`}
                  onClick={() => setSelectingFor(2)}
                >
                  <span className="text-gray-400">Select Fighter 2</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Character Selection Grid */}
        <section className="mb-16">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold">Choose your Fighters</h2>
            <div className="text-gray-400">
              Selecting for <span className="text-yellow-400 font-bold">Fighter {selectingFor}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {characters.map((char) => (
              <CharacterCard 
                key={char.id} 
                character={char} 
                onSelect={handleSelect}
                selected={player1?.id === char.id || player2?.id === char.id}
              />
            ))}
          </div>
        </section>

        <SuggestMatch />

        {/* Storylines Preview */}
        <section className="mt-20 mb-16">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold italic">ACTIVE STORYLINES</h2>
            <Link href="/storylines" className="text-yellow-500 hover:underline font-bold">VIEW ALL →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {storylines.slice(0, 2).map(s => (
              <Link 
                key={s.id} 
                href={`/storylines/${s.id}`}
                className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-red-500 transition-all group"
              >
                <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2 block">{s.type}</span>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-red-500 transition-colors">{s.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">{s.description}</p>
                <div className="flex items-center text-xs font-bold text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {s.status.toUpperCase()}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
