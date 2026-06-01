import { NextRequest, NextResponse } from 'next/server';
import { getMatch, updateMatch } from '@/lib/db';
import { klingAI } from '@/lib/kling';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const match = await getMatch(id);

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    if (match.status === 'succeed' || match.status === 'failed') {
      return NextResponse.json(match);
    }

    // If processing, poll Kling AI
    if (match.task_id) {
      // Mock handling
      if (match.task_id.startsWith('mock_')) {
        // Simulate progress for mock tasks
        const elapsed = (Date.now() - new Date(match.created_at).getTime()) / 1000;
        if (elapsed > 10) { // 10 seconds for mock success
          const mockVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4'; // Big Buck Bunny placeholder
          await updateMatch(id, { status: 'succeed', video_url: mockVideoUrl });
          return NextResponse.json({ ...match, status: 'succeed', video_url: mockVideoUrl });
        }
        return NextResponse.json(match);
      }

      // Real API polling
      try {
        const task = await klingAI.getTaskStatus(match.task_id, 'text2video');
        
        if (task.task_status === 'succeed') {
          const videoUrl = task.task_result?.videos[0]?.url || '';
          await updateMatch(id, { status: 'succeed', video_url: videoUrl });
          return NextResponse.json({ ...match, status: 'succeed', video_url: videoUrl });
        } else if (task.task_status === 'failed') {
          await updateMatch(id, { status: 'failed' });
          return NextResponse.json({ ...match, status: 'failed' });
        }
      } catch (klingError) {
        console.error('Kling AI status check failed:', klingError);
        // Keep status as processing and let it retry next time
      }
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error('Error checking match status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
