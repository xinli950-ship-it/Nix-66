import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { fighter1, fighter2, user_email } = await req.json();
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
