import { NextRequest, NextResponse } from 'next/server';
import { updateMatch } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { winnerId } = await req.json();

    if (!winnerId) {
      return NextResponse.json({ error: 'winnerId is required' }, { status: 400 });
    }

    // For now, the first vote determines the winner in the DB 
    // (in a real app, you'd aggregate votes, but for this demo, 
    // let's make it impactful)
    await updateMatch(id, { winner_id: winnerId } as any);

    return NextResponse.json({ message: 'Vote recorded' });
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}
