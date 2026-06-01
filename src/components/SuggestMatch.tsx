'use client';

import { useState } from 'react';

export default function SuggestMatch() {
  const [suggestion, setSuggestion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestion.trim()) {
      const parts = suggestion.split(/vs\.?| against /i);
      const fighter1 = parts[0]?.trim();
      const fighter2 = parts[1]?.trim() || 'TBD';

      try {
        const response = await fetch('/api/suggestion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fighter1, fighter2 }),
        });

        if (response.ok) {
          setSubmitted(true);
          setSuggestion('');
          setTimeout(() => setSubmitted(false), 3000);
        }
      } catch (error) {
        console.error('Error submitting suggestion:', error);
      }
    }
  };

  return (
    <section className="bg-gray-800 p-8 rounded-2xl border border-gray-700 mt-16">
      <h2 className="text-2xl font-bold mb-4">Suggest a Dream Match</h2>
      <p className="text-gray-400 mb-6">Don't see your favorite characters? Tell us who should fight next!</p>
      
      {submitted ? (
        <div className="bg-green-900/30 border border-green-500 text-green-400 p-4 rounded-lg">
          Thanks for your suggestion! We'll look into it.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="e.g. He-Man vs. Lion-O"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
            required
          />
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-500 px-8 py-2 rounded-lg font-bold transition-colors"
          >
            Submit Suggestion
          </button>
        </form>
      )}
    </section>
  );
}
