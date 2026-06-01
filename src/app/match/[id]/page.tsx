'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import SuggestMatch from '@/components/SuggestMatch';
import { characters } from '@/data/characters';

export default function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [voted, setVoted] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fighter1 = characters.find(c => c.id === matchData?.player1_id);
  const fighter2 = characters.find(c => c.id === matchData?.player2_id);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/match/${resolvedParams.id}/status`);
        const data = await response.json();
        setMatchData(data);
        setLoading(false);

        if (data.status === 'succeed' || data.status === 'failed') {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Error fetching match status:', error);
      }
    };

    fetchStatus();
    pollInterval = setInterval(fetchStatus, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [resolvedParams.id]);
  
  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto text-center">
        <header className="mb-12">
          <Link href="/" className="text-blue-400 hover:underline mb-4 inline-block">
            ← Back to Character Selection
          </Link>
          <h1 className="text-4xl font-bold mt-4 italic">EPIC DREAM MATCH</h1>
          <p className="text-gray-400 mt-2">Match ID: {resolvedParams.id}</p>
        </header>

        <div className="aspect-video bg-black rounded-xl border border-gray-700 flex items-center justify-center mb-8 relative overflow-hidden shadow-2xl">
          {matchData?.status === 'succeed' && matchData.video_url ? (
            <video 
              src={matchData.video_url} 
              controls 
              autoPlay 
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                <div className="text-left w-full flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold text-yellow-500 uppercase tracking-widest">
                      {matchData?.status === 'failed' ? 'Battle Failed' : 'Generating Battle...'}
                    </h2>
                    <p className="text-gray-300">
                      {matchData?.status === 'failed' 
                        ? 'Something went wrong with the AI generation.' 
                        : 'Kling AI is crafting your masterpiece.'}
                    </p>
                  </div>
                  {matchData?.status !== 'failed' && (
                    <button className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      LIVE GEN
                    </button>
                  )}
                </div>
              </div>
              <div className="animate-pulse flex flex-col items-center">
                {matchData?.status === 'failed' ? (
                  <div className="text-red-500 text-6xl">✕</div>
                ) : (
                  <>
                    <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-xl font-medium tracking-tight">RENDERING CROSSOVER...</p>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-12">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-red-400">Match Details</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <span className="text-gray-500">Status:</span> 
                <span className={`ml-2 ${matchData?.status === 'succeed' ? 'text-green-500' : matchData?.status === 'failed' ? 'text-red-500' : 'text-yellow-500 animate-pulse font-medium'}`}>
                  {matchData?.status || 'Loading...'}
                </span>
              </li>
              <li><span className="text-gray-500">Estimated Time:</span> {matchData?.status === 'succeed' ? 'Completed' : '2-3 minutes'}</li>
              <li><span className="text-gray-500">Engine:</span> Kling AI v1.5 (Global)</li>
            </ul>
            <div className="mt-6 pt-6 border-t border-gray-700">
              <button 
                disabled={matchData?.status !== 'succeed'}
                className={`w-full bg-gray-700 px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${matchData?.status === 'succeed' ? 'hover:bg-gray-600' : 'opacity-50 cursor-not-allowed'}`}
              >
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                Export for YouTube
              </button>
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-blue-400">Share Match</h3>
            <p className="text-gray-300 mb-4">Let the world see this epic crossover!</p>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-[#1DA1F2] hover:bg-[#1a8cd8] px-4 py-2 rounded font-bold transition-colors">X / Twitter</button>
              <button className="bg-[#4267B2] hover:bg-[#365899] px-4 py-2 rounded font-bold transition-colors">Facebook</button>
              <button className="bg-[#E1306C] hover:bg-[#c13584] px-4 py-2 rounded font-bold transition-colors">Instagram</button>
              <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded font-bold transition-colors">Copy Link</button>
            </div>
          </div>
        </div>

        {/* Voting Section */}
        <section className="bg-gradient-to-r from-red-900/20 to-blue-900/20 p-8 rounded-2xl border border-gray-700 mb-12">
          <h2 className="text-3xl font-black mb-2 italic">WHO SHOULD WIN?</h2>
          <p className="text-gray-400 mb-8 uppercase tracking-widest text-sm font-bold">Cast your vote for the champion</p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-red-900/50 border-2 border-red-500 flex items-center justify-center text-3xl font-bold overflow-hidden">
                {fighter1 ? (
                  <img src={fighter1.imageUrl} alt={fighter1.name} className="w-full h-full object-cover" />
                ) : 'F1'}
              </div>
              <button 
                onClick={() => setVoted('player1')}
                disabled={voted !== null}
                className={`px-8 py-2 rounded-full font-bold transition-all ${voted === 'player1' ? 'bg-red-500 text-white' : 'bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white'}`}
              >
                {voted === 'player1' ? 'VOTED!' : (fighter1?.name || 'FIGHTER 1')}
              </button>
            </div>

            <div className="text-2xl font-black text-gray-500">OR</div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-blue-900/50 border-2 border-blue-500 flex items-center justify-center text-3xl font-bold overflow-hidden">
                {fighter2 ? (
                  <img src={fighter2.imageUrl} alt={fighter2.name} className="w-full h-full object-cover" />
                ) : 'F2'}
              </div>
              <button 
                onClick={() => setVoted('player2')}
                disabled={voted !== null}
                className={`px-8 py-2 rounded-full font-bold transition-all ${voted === 'player2' ? 'bg-blue-500 text-white' : 'bg-transparent border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'}`}
              >
                {voted === 'player2' ? 'VOTED!' : (fighter2?.name || 'FIGHTER 2')}
              </button>
            </div>
          </div>
        </section>

        <SuggestMatch />
      </div>
    </main>
  );
}
