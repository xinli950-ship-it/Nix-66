import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 border-b border-gray-700 py-4 px-8 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
          DREAM MATCHES
        </Link>
        <div className="flex gap-6 items-center">
          <Link href="/storylines" className="text-gray-300 hover:text-white font-bold transition-colors">
            STORYLINES
          </Link>
          <Link href="/" className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold transition-all text-sm">
            CREATE MATCH
          </Link>
        </div>
      </div>
    </nav>
  );
}
