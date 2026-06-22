import { NextRequest, NextResponse } from 'next/server';
import { addMatchToStoryline } from '@/lib/storylines';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storylineId } = await params;
    const body = await req.json();
    const { matchId, chapterNumber, chapterTitle } = body;

    if (!matchId || chapterNumber === undefined) {
      return NextResponse.json({ error: 'matchId and chapterNumber are required' }, { status: 400 });
    }

    await addMatchToStoryline(matchId, storylineId, chapterNumber, chapterTitle);

    return NextResponse.json({ message: 'Match added to storyline' }, { status: 201 });
  } catch (error) {
    console.error('Error adding match to storyline:', error);
    return NextResponse.json({ error: 'Failed to add match to storyline' }, { status: 500 });
  }
}
