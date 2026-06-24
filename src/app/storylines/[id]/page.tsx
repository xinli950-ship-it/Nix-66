export const dynamic = 'force-dynamic';

import { getStoryline, getStorylineMatches, getCharacterStats } from '@/lib/storylines';
import { characters } from '@/data/characters';
import Link from 'next/link';
import Image from 'next/image';

export default async function StorylineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let storyline = null;
  try {
    storyline = await getStoryline(id);
  } catch (e) {
    console.error('Failed to load storyline:', e);
  }
  
  if (!storyline) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-400">Storyline not found</p>
          <Link href="/storylines" className="mt-6 inline-block text-yellow-500 hover:underline">
            Back to storylines
          </Link>
        </div>
      </div>
    );
  }

  let matches: any[] = [];
  let stats: Record<string, { wins: number; losses: number; draws: number }> = {};
  try {
    matches = await getStorylineMatches(id);
    stats = await getCharacterStats(id);
  } catch (e) {
    console.error('Failed to load storyline data:', e);
  }

  return (
    <main className="flex-1 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/storylines" className="text-gray-500 hover:text-white mb-8 inline-block text-sm font-bold tracking-widest">
          ← BACK TO ALL SAGAS
        </Link>
        
        <header className="mb-12 relative rounded-3xl overflow-hidden group">
          {storyline.image_url ? (
             <div className="h-64 md:h-80 w-full relative">
               <img 
                 src={storyline.image_url} 
                 alt={storyline.title}
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
             </div>
          ) : (
            <div className="h-48 bg-gradient-to-r from-red-900 to-blue-900"></div>
          )}
          
          <div className="absolute bottom-0 left-0 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">
                ACTIVE ARC
              </span>
              <span className="text-gray-400 text-xs font-mono">EST. 2026</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-4 italic text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              {storyline.title.toUpperCase()}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl leading-relaxed font-medium">
              {storyline.description}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Matches / Chapters Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-4">
                <span className="bg-red-600 w-1 h-8 rounded-full"></span>
                THE STORY SO FAR
              </h2>
              <span className="text-gray-500 text-xs font-bold">{matches.length} CHAPTERS</span>
            </div>
            
            <div className="space-y-8 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-px before:bg-gray-800">
              {matches.length > 0 ? (
                matches.map((match: any, index: number) => {
                  const p1 = characters.find(c => c.id === match.player1_id);
                  const p2 = characters.find(c => c.id === match.player2_id);
                  const winner = match.winner_id;

                  return (
                    <div key={match.id} className="relative pl-16">
                      <div className="absolute left-6 top-6 w-4 h-4 rounded-full bg-gray-900 border-4 border-red-600 z-10"></div>
                      
                      <Link 
                        href={`/match/${match.id}`}
                        className="block bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-red-500/50 transition-all p-8 group"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="text-red-500 font-black text-xs uppercase tracking-[0.2em] mb-1 block">
                              CHAPTER {match.chapter_number || index + 1}
                            </span>
                            <h3 className="text-2xl font-bold italic group-hover:text-red-500 transition-colors">
                              {match.chapter_title || 'The Battle Begins'}
                            </h3>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest ${
                            match.status === 'succeed' ? 'bg-green-900/30 text-green-400' : 
                            match.status === 'failed' ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'
                          }`}>
                            {match.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between gap-6 bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                          <div className={`flex-1 text-center group-hover:scale-105 transition-transform ${winner === match.player1_id ? 'text-yellow-400' : ''}`}>
                            <p className="font-black text-lg">{p1?.name.toUpperCase() || 'UNKNOWN'}</p>
                            {winner === match.player1_id && (
                              <div className="mt-1 flex items-center justify-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase">Winner</span>
                              </div>
                            )}
                          </div>
                          <div className="text-gray-700 font-black italic text-2xl">VS</div>
                          <div className={`flex-1 text-center group-hover:scale-105 transition-transform ${winner === match.player2_id ? 'text-yellow-400' : ''}`}>
                            <p className="font-black text-lg">{p2?.name.toUpperCase() || 'UNKNOWN'}</p>
                            {winner === match.player2_id && (
                              <div className="mt-1 flex items-center justify-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase">Winner</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                           <span className="text-xs font-bold text-gray-500 group-hover:text-red-500 flex items-center transition-colors">
                             WATCH REPLAY <span className="ml-2">→</span>
                           </span>
                        </div>
                      </Link>
                    </div>
                  );
                })
              ) : (
                <div className="ml-16 bg-gray-800/20 rounded-2xl border border-dashed border-gray-700 p-16 text-center">
                  <p className="text-gray-500 italic font-medium">The saga is just beginning. No matches have been recorded for this arc yet.</p>
                  <Link href="/" className="mt-6 inline-block bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors">
                    CREATE FIRST CHAPTER
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Stats Column */}
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-4">
                <span className="bg-yellow-500 w-1 h-8 rounded-full"></span>
                STANDINGS
              </h2>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-900/50 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <tr>
                      <th className="p-6">FIGHTER</th>
                      <th className="p-6 text-center">W</th>
                      <th className="p-6 text-center">L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {Object.entries(stats).sort((a: any, b: any) => b[1].wins - a[1].wins).map(([charId, data]: [string, any]) => {
                      const char = characters.find(c => c.id === charId);
                      return (
                        <tr key={charId} className="hover:bg-white/5 transition-colors group">
                          <td className="p-6 font-bold flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                               <img src={char?.imageUrl} className="w-full h-full object-cover" />
                             </div>
                             <span className="group-hover:text-yellow-500 transition-colors">{char?.name.toUpperCase() || 'UNKNOWN'}</span>
                          </td>
                          <td className="p-6 text-center text-green-400 font-mono font-bold text-lg">{data.wins}</td>
                          <td className="p-6 text-center text-red-500 font-mono font-bold text-lg">{data.losses}</td>
                        </tr>
                      );
                    })}
                    {Object.keys(stats).length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-12 text-center text-gray-600 italic font-medium">No stats available yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Branding Sidebar Item */}
            <div className="bg-gradient-to-br from-red-600 to-red-900 rounded-2xl p-8 relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-xl font-black italic mb-2">TALE OF THE TAPE</h3>
                 <p className="text-red-100 text-sm font-medium mb-6">Analyze the fighters before the next big chapter drops.</p>
                 <img src="/branding/tale_of_the_tape_mockup.svg" className="w-full h-auto rounded shadow-2xl invert" />
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
