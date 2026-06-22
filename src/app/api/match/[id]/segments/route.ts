import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await query(
      "SELECT * FROM match_segments WHERE match_id = ? ORDER BY order_index ASC",
      [id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching segments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
