'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import SuggestMatch from '@/components/SuggestMatch';
import { characters } from '@/data/characters';

export default function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [voted, setVoted] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<any>(null);
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fighter1 = characters.find(c => c.id === matchData?.player1_id);
  const fighter2 = characters.find(c => c.id === matchData?.player2_id);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    const fetchStatus = async () => {
      try {
        const [matchRes, segmentsRes] = await Promise.all([
          fetch(`/api/match/${resolvedParams.id}/status`),
          fetch(`/api/match/${resolvedParams.id}/segments`)
        ]);
        const matchData = await matchRes.json();
        const segmentsData = await segmentsRes.json();
        setMatchData(matchData);
        setSegments(segmentsData);
        setLoading(false);
        if (matchData.status === 'succeed' || matchData.status === 'failed') {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Error fetching match status:', error);
      }
    };
    fetchStatus();
    pollInterval = setInterval(fetchStatus, 3000);
    return () => clearInterval(pollInterval);
  }, [resolvedParams.id]);

  const handleVote = async (winner: 'player1' | 'player2') => {
    if (voted || matchData?.winner_id) return;
    const winnerId = winner === 'player1' ? matchData?.player1_id : matchData?.player2_id;
    setVoted(winnerId);
    try {
      await fetch(`/api/match/${resolvedParams.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId }),
      });
      const response = await fetch(`/api/match/${resolvedParams.id}/status`);
      const data = await response.json();
      setMatchData(data);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const isDecided = !!matchData?.winner_id;
  const currentWinnerId = matchData?.winner_id;
  const completedSegments = segments.filter(s => s.status === 'succeed').length;
  const totalSegments = segments.length;
  const progressPercent = totalSegments > 0 ? (completedSegments / totalSegments) * 100 : 0;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 pt-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-gray-500 hover:text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2 mb-4">
              ← BACK TO CHARACTER SELECTION
            </Link>
            <h1 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
              DREAM MATCH RESULT
            </h1>
          </div>
          {matchData?.storyline_id && (
            <Link href={`/storylines/${matchData.storyline_id}`}
              className="bg-red-600/10 border border-red-500/50 rounded-2xl p-4 hover:bg-red-600/20 transition-all flex items-center gap-4 group">
              <div>
                <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter block mb-1">PART OF THE SAGA</span>
                <span className="font-bold text-sm group-hover:text-red-500 transition-colors">VIEW STORYLINE PROGRESS →</span>
              </div>
            </Link>
          )}
        </header>

        <div className="aspect-video bg-black rounded-3xl border border-gray-800 flex items-center justify-center mb-12 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {matchData?.status === 'succeed' && matchData.video_url ? (
            <video src={matchData.video_url} controls autoPlay className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                {matchData?.status === 'failed' ? (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mb-6 mx-auto border-2 border-red-600">
                      <span className="text-4xl">✕</span>
                    </div>
                    <h2 className="text-3xl font-black italic mb-2">BATTLE COLLAPSED</h2>
                    <p className="text-gray-400 max-w-md mx-auto">The AI encountered a temporal rift. This match could not be rendered.</p>
                  </div>
                ) : (
                  <div className="text-center w-full max-w-md">
                    <div className="relative w-32 h-32 mb-8 mx-auto">
                      <div className="absolute inset-0 border-4 border-red-600/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-4 bg-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-black italic">VS</span>
                      </div>
                    </div>
                    <h2 className="text-3xl font-black italic mb-2 animate-pulse tracking-tight uppercase">
                      {totalSegments > 0 ? 'Assembling Feature Film' : 'Initializing Pipeline'}
                    </h2>
                    <p className="text-gray-400 font-medium uppercase tracking-widest text-xs mb-8">
                      {completedSegments} of {totalSegments} segments rendered
                    </p>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-gradient-to-r from-red-600 to-yellow-500 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {segments.map((s, i) => (
                        <div key={s.id} className={`h-1 rounded-full ${s.status === 'succeed' ? 'bg-green-500' : s.status === 'processing' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-700'}`}></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="md:col-span-2 space-y-8">
            {segments.length > 0 && (
              <section className="bg-gray-800/40 backdrop-blur-sm p-8 rounded-3xl border border-gray-700">
                <h2 className="text-2xl font-black mb-6 italic flex items-center gap-3">
                  <span className="bg-red-600 w-1 h-6 rounded-full"></span>
                  MATCH CHAPTERS
                </h2>
                <div className="space-y-3">
                  {segments.map((segment, index) => (
                    <div key={segment.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600 font-mono text-xs">{(index + 1).toString().padStart(2, '0')}</span>
                        <div>
                          <h4 className="font-bold text-sm">{segment.title}</h4>
                          <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{segment.segment_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-gray-500">{segment.duration}s</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${segment.status === 'succeed' ? 'bg-green-900/30 text-green-400' : segment.status === 'processing' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-800 text-gray-600'}`}>
                          {segment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="bg-gray-800/40 backdrop-blur-sm p-10 rounded-3xl border border-gray-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Community Decision</span>
              </div>
              <h2 className="text-3xl font-black mb-8 italic flex items-center gap-4">
                <span className="bg-yellow-500 w-1 h-8 rounded-full"></span>
                {isDecided ? 'THE WINNER IS...' : 'DETERMINE THE OUTCOME'}
              </h2>
              <div className="flex justify-around items-center gap-4">
                <div className="flex flex-col items-center gap-6 group">
                  <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 transition-all duration-500 ${currentWinnerId === fighter1?.id ? 'border-yellow-500 scale-110 shadow-[0_0_30px_rgba(234,179,8,0.3)]' : isDecided ? 'border-gray-800 grayscale opacity-50' : 'border-red-600 group-hover:border-white'}`}>
                    {fighter1?.imageUrl ? (
                      <img src={fighter1.imageUrl} alt={fighter1.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center font-bold">{fighter1?.name[0]}</div>
                    )}
                    {currentWinnerId === fighter1?.id && (
                      <div className="absolute inset-0 bg-yellow-500/10 flex items-center justify-center">
                        <div className="bg-yellow-500 text-black font-black text-[10px] py-1 px-3 rounded-full shadow-lg">CHAMPION</div>
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleVote('player1')} disabled={isDecided || voted !== null}
                    className={`w-full py-3 px-6 rounded-xl font-black transition-all text-sm tracking-widest ${currentWinnerId === fighter1?.id ? 'bg-yellow-500 text-black' : isDecided ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : voted === fighter1?.id ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-red-600 hover:text-white'}`}>
                    {currentWinnerId === fighter1?.id ? 'VICTORIOUS' : (fighter1?.name || 'FIGHTER 1').toUpperCase()}
                  </button>
                </div>
                <div className="text-4xl font-black italic text-gray-800">VS</div>
                <div className="flex flex-col items-center gap-6 group">
                  <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 transition-all duration-500 ${currentWinnerId === fighter2?.id ? 'border-yellow-500 scale-110 shadow-[0_0_30px_rgba(234,179,8,0.3)]' : isDecided ? 'border-gray-800 grayscale opacity-50' : 'border-blue-600 group-hover:border-white'}`}>
                    {fighter2?.imageUrl ? (
                      <img src={fighter2.imageUrl} alt={fighter2.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center font-bold">{fighter2?.name[0]}</div>
                    )}
                    {currentWinnerId === fighter2?.id && (
                      <div className="absolute inset-0 bg-yellow-500/10 flex items-center justify-center">
                        <div className="bg-yellow-500 text-black font-black text-[10px] py-1 px-3 rounded-full shadow-lg">CHAMPION</div>
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleVote('player2')} disabled={isDecided || voted !== null}
                    className={`w-full py-3 px-6 rounded-xl font-black transition-all text-sm tracking-widest ${currentWinnerId === fighter2?.id ? 'bg-yellow-500 text-black' : isDecided ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : voted === fighter2?.id ? 'bg-blue-500 text-white' : 'bg-white text-black hover:bg-blue-600 hover:text-white'}`}>
                    {currentWinnerId === fighter2?.id ? 'VICTORIOUS' : (fighter2?.name || 'FIGHTER 2').toUpperCase()}
                  </button>
                </div>
              </div>
              {isDecided && (
                <div className="mt-12 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-center">
                  <p className="text-yellow-500 font-bold text-sm">Standings have been updated for this Saga.</p>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-800/80 rounded-3xl border border-gray-700 p-8 shadow-xl">
              <h3 className="text-xl font-black italic mb-6 flex items-center gap-3">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                BATTLE INTEL
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Status</span>
                  <span className={`text-xs font-black px-2 py-1 rounded uppercase ${matchData?.status === 'succeed' ? 'bg-green-900/30 text-green-400' : matchData?.status === 'failed' ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                    {matchData?.status || 'INITIATING'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Venue</span>
                  <span className="text-xs font-black uppercase">Neutral Multiverse Arena</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Match ID</span>
                  <span className="text-[10px] font-mono text-gray-400">{resolvedParams.id.substring(0, 18)}...</span>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-700">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">HUD OVERLAY</h4>
                <img src="/branding/hud_overlay_mockup.svg" className="w-full h-auto rounded-lg border border-gray-700 invert" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-3xl p-8 shadow-xl group">
              <h3 className="text-xl font-black italic mb-2">PROMOTE BATTLE</h3>
              <p className="text-blue-100 text-sm mb-6 font-medium">Download the high-res file and share the multiverse chaos.</p>
              <button className="w-full bg-white text-blue-900 py-3 rounded-xl font-black text-xs tracking-widest hover:bg-blue-50 transition-colors">
                EXPORT 4K MP4
              </button>
            </div>
          </div>
        </div>
        <SuggestMatch />
      </div>
    </main>
  );
}
