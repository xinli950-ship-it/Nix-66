import { NextRequest, NextResponse } from 'next/server';
import { getStoryline, updateStoryline, getStorylineMatches, getCharacterStats } from '@/lib/storylines';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storyline = await getStoryline(id);
    
    if (!storyline) {
      return NextResponse.json({ error: 'Storyline not found' }, { status: 404 });
    }

    const matches = await getStorylineMatches(id);
    const stats = await getCharacterStats(id);

    return NextResponse.json({
      ...storyline,
      matches,
      stats
    });
  } catch (error) {
    console.error('Error fetching storyline detail:', error);
    return NextResponse.json({ error: 'Failed to fetch storyline detail' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    await updateStoryline(id, body);
    
    return NextResponse.json({ message: 'Storyline updated successfully' });
  } catch (error) {
    console.error('Error updating storyline:', error);
    return NextResponse.json({ error: 'Failed to update storyline' }, { status: 500 });
  }
}
