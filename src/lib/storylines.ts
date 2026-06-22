import { query } from './db';
import { v4 as uuidv4 } from 'uuid';

export interface Storyline {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed';
  type: string;
  image_url?: string;
  created_at: string;
}

export interface StorylineMatch {
  id: string;
  storyline_id: string;
  match_id: string;
  chapter_number: number;
  chapter_title?: string;
}

export async function getStorylines() {
  return await query("SELECT * FROM storylines ORDER BY created_at DESC") as Storyline[];
}

export async function getStoryline(id: string) {
  const storylines = await query("SELECT * FROM storylines WHERE id = ?", [id]) as Storyline[];
  return storylines[0] || null;
}

export async function createStoryline(storyline: Omit<Storyline, 'created_at'>) {
  return await query(
    "INSERT INTO storylines (id, title, description, status, type, image_url) VALUES (?, ?, ?, ?, ?, ?)",
    [storyline.id, storyline.title, storyline.description, storyline.status, storyline.type, storyline.image_url]
  );
}

export async function updateStoryline(id: string, updates: Partial<Storyline>) {
  const keys = Object.keys(updates);
  if (keys.length === 0) return;
  
  const sets = keys.map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), id];
  
  return await query(`UPDATE storylines SET ${sets} WHERE id = ?`, values);
}

export async function getStorylineMatches(storylineId: string) {
  return await query(`
    SELECT m.*, sm.chapter_number, sm.chapter_title 
    FROM matches m
    JOIN storyline_matches sm ON m.id = sm.match_id
    WHERE sm.storyline_id = ?
    ORDER BY sm.chapter_number ASC
  `, [storylineId]);
}

export async function addMatchToStoryline(matchId: string, storylineId: string, chapterNumber: number, chapterTitle?: string) {
  const id = uuidv4();
  return await query(
    "INSERT INTO storyline_matches (id, storyline_id, match_id, chapter_number, chapter_title) VALUES (?, ?, ?, ?, ?)",
    [id, storylineId, matchId, chapterNumber, chapterTitle]
  );
}

export async function getNextChapterNumber(storylineId: string) {
  const result = await query(
    "SELECT COALESCE(MAX(chapter_number), 0) + 1 as next_chapter FROM storyline_matches WHERE storyline_id = ?",
    [storylineId]
  ) as any[];
  return result[0]?.next_chapter || 1;
}

export async function getCharacterStats(storylineId: string) {
  const matches = await getStorylineMatches(storylineId);
  const stats: Record<string, { wins: number, losses: number, draws: number }> = {};

  matches.forEach((match: any) => {
    const p1 = match.player1_id;
    const p2 = match.player2_id;
    const winner = match.winner_id;

    if (!stats[p1]) stats[p1] = { wins: 0, losses: 0, draws: 0 };
    if (!stats[p2]) stats[p2] = { wins: 0, losses: 0, draws: 0 };

    if (winner === p1) {
      stats[p1].wins++;
      stats[p2].losses++;
    } else if (winner === p2) {
      stats[p2].wins++;
      stats[p1].losses++;
    } else if (match.status === 'succeed') {
      stats[p1].draws++;
      stats[p2].draws++;
    }
  });

  return stats;
}
