'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { characters, Character } from '@/data/characters';
import CharacterCard from '@/components/CharacterCard';
import SuggestMatch from '@/components/SuggestMatch';

export default function Home() {
  const [player1, setPlayer1] = useState<Character | null>(null);
  const [player2, setPlayer2] = useState<Character | null>(null);
  const [selectingFor, setSelectingFor] = useState<1 | 2>(1);

  const router = useRouter();

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
          body: JSON.stringify({ player1Id: player1.id, player2Id: player2.id }),
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
    <main className="min-h-screen bg-gray-900 text-white p-8">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-16 bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl">
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

          <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-6xl font-black italic text-gray-600">VS</div>
            <button
              onClick={startMatch}
              disabled={!player1 || !player2}
              className={`px-8 py-4 rounded-full font-bold text-xl transition-all ${
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
      </div>
    </main>
  );
}
