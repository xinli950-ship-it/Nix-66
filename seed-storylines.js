const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

async function runSql(sql) {
  try {
    const { stdout } = await execPromise(`team-db "${sql.replace(/"/g, '\\"')}"`);
    return JSON.parse(stdout);
  } catch (error) {
    console.error('SQL Error:', error);
    return null;
  }
}

async function seed() {
  const storylines = [
    {
      id: 'forbidden-door',
      title: 'The Forbidden Door',
      description: 'The barriers between dimensions have shattered! Goku challenges the Tribal Chief Roman Reigns in a battle for supreme dominance. Anime meets Wrestling in this unprecedented crossover event.',
      status: 'active',
      type: 'Crossover Event',
      image_url: 'https://placehold.co/800x400?text=Forbidden+Door'
    },
    {
      id: 'omniverse-clash',
      title: 'Omniverse Clash',
      description: 'Ben 10 enters the AEW ring to face "The Best Bout Machine" Kenny Omega. With the Omnitrix vs. the V-Trigger, who will emerge as the ultimate champion of the multiverse?',
      status: 'active',
      type: 'Multiverse Saga',
      image_url: 'https://placehold.co/800x400?text=Omniverse+Clash'
    },
    {
      id: 'toku-legends',
      title: 'Toku Legends',
      description: 'The King of the Monsters, Godzilla, defends his throne against legendary Tokusatsu heroes and villains. A saga of giant proportions.',
      status: 'active',
      type: 'Giant Monster Saga',
      image_url: 'https://placehold.co/800x400?text=Toku+Legends'
    },
    {
      id: 'elite-vs-bloodline',
      title: 'Elite vs Bloodline',
      description: 'The two most dominant factions in professional wrestling finally collide. The Young Bucks and Kenny Omega face off against Roman Reigns and the Bloodline for control of the industry.',
      status: 'active',
      type: 'Faction War',
      image_url: 'https://placehold.co/800x400?text=Elite+vs+Bloodline'
    }
  ];

  for (const s of storylines) {
    await runSql(`INSERT OR REPLACE INTO storylines (id, title, description, status, type, image_url) VALUES ('${s.id}', '${s.title}', '${s.description.replace(/'/g, "''")}', '${s.status}', '${s.type}', '${s.image_url}')`);
  }

  console.log('Storylines seeded.');

  // Create some initial matches for these storylines
  const initialMatches = [
    { id: 'match-1', p1: '1', p2: '3', status: 'succeed', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', winner_id: '1' }, // Goku vs Roman
    { id: 'match-2', p1: '11', p2: '4', status: 'processing', video_url: null, winner_id: null }, // Ben 10 vs Omega
    { id: 'match-3', p1: '4', p2: '3', status: 'succeed', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', winner_id: '4' }, // Omega vs Roman
  ];

  for (const m of initialMatches) {
    await runSql(`INSERT OR REPLACE INTO matches (id, player1_id, player2_id, status, video_url, winner_id) VALUES ('${m.id}', '${m.p1}', '${m.p2}', '${m.status}', ${m.video_url ? `'${m.video_url}'` : 'NULL'}, ${m.winner_id ? `'${m.winner_id}'` : 'NULL'})`);
  }

  // Link matches to storylines
  const links = [
    { match_id: 'match-1', storyline_id: 'forbidden-door', chapter: 1, title: 'The Opening Challenge' },
    { match_id: 'match-2', storyline_id: 'omniverse-clash', chapter: 1, title: 'Hero Time in AEW' },
    { match_id: 'match-3', storyline_id: 'elite-vs-bloodline', chapter: 1, title: 'The First Encounter' },
  ];

  for (const l of links) {
    const id = uuidv4();
    await runSql(`INSERT OR REPLACE INTO storyline_matches (id, storyline_id, match_id, chapter_number, chapter_title) VALUES ('${id}', '${l.storyline_id}', '${l.match_id}', ${l.chapter}, '${l.title}')`);
  }

  console.log('Matches linked to storylines.');
}

seed();
