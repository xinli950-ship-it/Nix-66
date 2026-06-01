import { NextRequest, NextResponse } from 'next/server';
import { characters } from '@/data/characters';
import { createMatch, updateMatch } from '@/lib/db';
import { klingAI } from '@/lib/kling';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { player1Id, player2Id } = await req.json();

    if (!player1Id || !player2Id) {
      return NextResponse.json({ error: 'Missing player IDs' }, { status: 400 });
    }

    const player1 = characters.find(c => c.id === player1Id);
    const player2 = characters.find(c => c.id === player2Id);

    if (!player1 || !player2) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    const matchId = uuidv4();
    await createMatch(matchId, player1Id, player2Id);

    // Call Kling AI or use Mock
    const prompt = `Epic battle between ${player1.name} from ${player1.universe} and ${player2.name} from ${player2.universe}. High quality, cinematic action scene.`;
    
    const useMock = process.env.USE_MOCK_VIDEO === 'true' || !process.env.KLING_ACCESS_KEY;

    if (useMock) {
      const mockTaskId = `mock_${uuidv4()}`;
      await updateMatch(matchId, { task_id: mockTaskId, status: 'processing' });
      return NextResponse.json({ matchId, taskId: mockTaskId, mock: true });
    }

    try {
      const task = await klingAI.createTextToVideo({
        model_name: 'kling-v1',
        prompt,
        duration: '5',
        aspect_ratio: '16:9',
      });

      await updateMatch(matchId, { task_id: task.task_id, status: 'processing' });
      
      return NextResponse.json({ matchId, taskId: task.task_id });
    } catch (klingError) {
      console.error('Kling AI call failed, falling back to mock:', klingError);
      const mockTaskId = `mock_${uuidv4()}`;
      await updateMatch(matchId, { task_id: mockTaskId, status: 'processing' });
      return NextResponse.json({ matchId, taskId: mockTaskId, mock: true });
    }

  } catch (error) {
    console.error('Error generating match:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
