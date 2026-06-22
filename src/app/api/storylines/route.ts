import { NextRequest, NextResponse } from 'next/server';
import { getStorylines, createStoryline } from '@/lib/storylines';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const storylines = await getStorylines();
    return NextResponse.json(storylines);
  } catch (error) {
    console.error('Error fetching storylines:', error);
    return NextResponse.json({ error: 'Failed to fetch storylines' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, status, type, image_url } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const id = uuidv4();
    await createStoryline({
      id,
      title,
      description: description || '',
      status: status || 'active',
      type: type || 'Saga',
      image_url: image_url || ''
    });

    return NextResponse.json({ id, title, description, status, type, image_url }, { status: 201 });
  } catch (error) {
    console.error('Error creating storyline:', error);
    return NextResponse.json({ error: 'Failed to create storyline' }, { status: 500 });
  }
}
