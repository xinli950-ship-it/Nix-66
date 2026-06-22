import { createClient } from '@libsql/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Production Turso client
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = url ? createClient({
  url,
  authToken,
}) : null;

// In-memory mock storage for when no DB is available (e.g. Vercel without Turso)
const mockMatches: Record<string, any> = {};
const mockSuggestions: Record<string, any> = {};

export async function query(sql: string, params: any[] = []) {
  // If we have Turso credentials, use the driver (Production mode)
  if (client) {
    try {
      const result = await client.execute({ sql, args: params });
      return result.rows;
    } catch (error) {
      console.error('Turso query error:', error);
      throw error;
    }
  }

  // Fallback to team-db CLI (Sandbox mode)
  if (process.env.NODE_ENV === 'development' || !process.env.VERCEL) {
    try {
      // Basic param substitution for team-db CLI (simple cases)
      let finalSql = sql;
      params.forEach(param => {
        finalSql = finalSql.replace('?', typeof param === 'string' ? `'${param.replace(/'/g, "''")}'` : param);
      });
      const { stdout } = await execPromise(`team-db "${finalSql.replace(/"/g, '\\"')}"`);
      return JSON.parse(stdout);
    } catch (error) {
      console.error('Database query error (team-db fallback):', error);
      // If team-db fails, fall through to in-memory mock
    }
  }

  // In-memory mock for Vercel demo without Turso
  console.warn('Using in-memory mock database (non-persistent)');
  if (sql.startsWith('INSERT INTO matches')) {
    const [id, p1, p2, status] = params;
    mockMatches[id] = { id, player1_id: p1, player2_id: p2, status, created_at: new Date().toISOString() };
    return [];
  }
  if (sql.startsWith('SELECT * FROM matches WHERE id =')) {
    const id = sql.match(/'([^']+)'/)?.[1] || params[0];
    return mockMatches[id] ? [mockMatches[id]] : [];
  }
  if (sql.startsWith('UPDATE matches SET')) {
    const id = sql.match(/WHERE id = '([^']+)'/)?.[1];
    if (id && mockMatches[id]) {
      // Simple parser for updates
      if (sql.includes("status = 'succeed'")) mockMatches[id].status = 'succeed';
      if (sql.includes("status = 'failed'")) mockMatches[id].status = 'failed';
      const videoMatch = sql.match(/video_url = '([^']+)'/);
      if (videoMatch) mockMatches[id].video_url = videoMatch[1];
      const winnerMatch = sql.match(/winner_id = '([^']+)'/);
      if (winnerMatch) mockMatches[id].winner_id = winnerMatch[1];
    }
    return [];
  }
  if (sql.startsWith('INSERT INTO suggestions')) {
    const [id, f1, f2, email] = params;
    mockSuggestions[id] = { id, fighter1: f1, fighter2: f2, user_email: email, created_at: new Date().toISOString() };
    return [];
  }
  
  return [];
}

export async function getMatch(id: string) {
  const rows = await query(`SELECT * FROM matches WHERE id = '${id}'`);
  return rows[0] || null;
}

export async function createMatch(id: string, player1Id: string, player2Id: string) {
  return await query('INSERT INTO matches (id, player1_id, player2_id, status) VALUES (?, ?, ?, ?)', [id, player1Id, player2Id, 'submitted']);
}

export async function updateMatch(id: string, updates: { status?: string, video_url?: string, task_id?: string, winner_id?: string }) {
  const sets = Object.entries(updates)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(', ');
  return await query(`UPDATE matches SET ${sets} WHERE id = '${id}'`);
}
