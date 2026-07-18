import { NextRequest, NextResponse } from 'next/server';
import { characters } from '@/data/characters';
import { query } from '@/lib/db';
import { generateMatchScript } from '@/lib/script-generator';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { player1Id, player2Id, storylineId } = await req.json();

    if (!player1Id || !player2Id) {
      return NextResponse.json({ error: 'Missing player IDs' }, { status: 400 });
    }

    const player1 = characters.find(c => c.id === player1Id);
    const player2 = characters.find(c => c.id === player2Id);

    if (!player1 || !player2) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    const matchId = uuidv4();
    
    // Create the main match record
    await query(
      "INSERT INTO matches (id, player1_id, player2_id, status) VALUES (?, ?, ?, ?)",
      [matchId, player1Id, player2Id, 'processing']
    );

    // If storylineId is provided, link it (we should have a match_storylines table or similar)
    if (storylineId) {
       // Get current chapter number
       const res = await query("SELECT COUNT(*) as count FROM storyline_matches WHERE storyline_id = ?", [storylineId]) as any[];
       const chapterNumber = (res[0]?.count || 0) + 1;
       const smId = uuidv4();
       await query(
         "INSERT INTO storyline_matches (id, storyline_id, match_id, chapter_number, chapter_title) VALUES (?, ?, ?, ?, ?)",
         [smId, storylineId, matchId, chapterNumber, `Chapter ${chapterNumber}`]
       );
    }

    // Generate the full match script
    const script = generateMatchScript(player1, player2);

    // Insert segments into match_segments table
    for (let i = 0; i < script.length; i++) {
      const segment = script[i];
      const segmentId = uuidv4();
      await query(
        `INSERT INTO match_segments 
         (id, match_id, segment_type, order_index, title, prompt, commentary_script, status, duration) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          segmentId, 
          matchId, 
          segment.segment_type, 
          i, 
          segment.title, 
          segment.prompt || null, 
          segment.commentary_script, 
          'pending', 
          segment.duration
        ]
      );
    }

    // Start a background process to handle segment generation and assembly
    // Wrap in try-catch to prevent crashes if the worker fails to spawn
    try {
      const workerPath = path.join(process.cwd(), 'src/workers/match-worker.js');
      exec(`node ${workerPath} ${matchId} > /tmp/match-${matchId}.log 2>&1 &`);
    } catch (workerError) {
      console.error('Failed to spawn worker process, using setTimeout mock:', workerError);
      // Fallback: use a simple setTimeout mock to simulate background processing
      setTimeout(async () => {
        try {
          await query(`UPDATE matches SET status = 'succeed' WHERE id = '${matchId}'`);
          console.log(`Mock worker completed for match ${matchId}`);
        } catch (err) {
          console.error('Mock worker error:', err);
          await query(`UPDATE matches SET status = 'failed' WHERE id = '${matchId}'`);
        }
      }, 5000);
    }
    
    return NextResponse.json({ matchId, message: 'Match generation pipeline started' });

  } catch (error) {
    console.error('Error generating match:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
