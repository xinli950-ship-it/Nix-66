export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getStorylines, Storyline } from '@/lib/storylines';

export default async function StorylinesPage() {
  let storylines: Storyline[] = [];
  try {
    storylines = await getStorylines();
  } catch (e) {
    console.error('Failed to load storylines:', e);
  }

  return (
    <main className="flex-1 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-gray-800 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl font-black mb-2 italic text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
              MULTIVERSE SAGAS
            </h1>
            <p className="text-gray-400 font-medium">Follow the ongoing narratives and multiverse crossovers across the Dream Matches universe.</p>
          </div>
          <div className="bg-gray-800 rounded-full px-4 py-2 border border-gray-700">
             <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">{storylines.length} ACTIVE ARCS</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {storylines.length > 0 ? (
            storylines.map((storyline) => (
              <Link 
                key={storyline.id} 
                href={`/storylines/${storyline.id}`}
                className="group bg-gray-900/50 backdrop-blur-sm rounded-3xl overflow-hidden border border-gray-800 hover:border-red-600/50 transition-all flex flex-col shadow-2xl"
              >
                <div className="h-64 relative overflow-hidden">
                  {storyline.image_url ? (
                    <img 
                      src={storyline.image_url} 
                      alt={storyline.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-900/20 to-blue-900/20 flex items-center justify-center p-6 text-center">
                       <span className="text-3xl font-black italic opacity-10">{storyline.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90"></div>
                  
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/10 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded uppercase tracking-[0.2em] border border-white/20">
                      {storyline.type || 'SAGA'}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-white text-[10px] font-black uppercase tracking-widest drop-shadow-md">
                      {storyline.status}
                    </span>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h2 className="text-3xl font-black italic mb-3 group-hover:text-red-500 transition-colors tracking-tight">
                    {storyline.title.toUpperCase()}
                  </h2>
                  <p className="text-gray-400 text-sm mb-8 line-clamp-3 font-medium leading-relaxed">
                    {storyline.description}
                  </p>
                  <div className="mt-auto pt-6 border-t border-gray-800/50 flex justify-between items-center">
                    <div className="flex -space-x-2">
                       {/* Placeholder for character icons involved */}
                       {[1,2,3].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center">
                           <span className="text-[10px] font-bold text-gray-500">?</span>
                         </div>
                       ))}
                    </div>
                    <span className="text-red-500 font-black group-hover:translate-x-2 transition-transform flex items-center text-xs tracking-widest">
                      ENTER SAGA <span className="ml-2">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-gray-900/50 rounded-3xl border border-dashed border-gray-800">
              <p className="text-gray-500 italic font-medium">No active storylines found. The multiverse is quiet... for now.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
