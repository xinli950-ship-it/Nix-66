import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { fighter1, fighter2, user_email } = await request.json();

    if (!fighter1 || !fighter2) {
      return NextResponse.json({ error: 'Fighter names are required' }, { status: 400 });
    }

    const id = uuidv4();
    await query(
      'INSERT INTO suggestions (id, fighter1, fighter2, user_email) VALUES (?, ?, ?, ?)',
      [id, fighter1, fighter2, user_email || null]
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving suggestion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const suggestions = await query('SELECT * FROM suggestions ORDER BY created_at DESC LIMIT 50');
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
