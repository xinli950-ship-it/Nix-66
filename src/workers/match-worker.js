const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

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

async function processMatch(matchId) {
  console.log(`Processing match ${matchId}...`);
  
  try {
    // 1. Get segments
    const segments = await runSql(`SELECT * FROM match_segments WHERE match_id = '${matchId}' ORDER BY order_index ASC`);
    if (!segments || segments.length === 0) {
      console.error('No segments found for match');
      return;
    }

    const workDir = path.join('/tmp', `match-${matchId}`);
    if (!fs.existsSync(workDir)) {
      fs.mkdirSync(workDir, { recursive: true });
    }

    const processedPaths = [];

    // 2. "Generate" segments (Mocking Kling/ElevenLabs)
    for (const segment of segments) {
      console.log(`Generating segment: ${segment.title}`);
      
      // Update status to processing
      await runSql(`UPDATE match_segments SET status = 'processing' WHERE id = '${segment.id}'`);
      
      // Simulate work
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const segmentPath = path.join(workDir, `segment-${segment.order_index}.mp4`);
      const processedPath = path.join(workDir, `processed-${segment.order_index}.mp4`);

      // Mock: Use a sample video
      const sampleUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
      await execPromise(`curl -L "${sampleUrl}" -o "${segmentPath}"`);

      // Normalize with FFmpeg
      console.log(`Normalizing segment ${segment.order_index}...`);
      await execPromise(`ffmpeg -y -i "${segmentPath}" -t ${segment.duration} -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,format=yuv420p" -r 30 -c:v libx264 -preset superfast "${processedPath}"`);
      
      processedPaths.push(processedPath);
      
      // Update segment status
      await runSql(`UPDATE match_segments SET status = 'succeed', video_url = '/segments/${matchId}-${segment.order_index}.mp4' WHERE id = '${segment.id}'`);
    }

    // 3. Assemble final video
    console.log('Assembling final video...');
    const listPath = path.join(workDir, 'list.txt');
    const listContent = processedPaths.map(p => `file '${p}'`).join('\n');
    fs.writeFileSync(listPath, listContent);

    const stitchedPath = path.join(workDir, 'stitched.mp4');
    await execPromise(`ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${stitchedPath}"`);

    // 4. Finalize
    const finalDir = '/home/team/shared/dream-matches-web/public/matches';
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }
    
    const finalPath = path.join(finalDir, `${matchId}.mp4`);
    fs.copyFileSync(stitchedPath, finalPath);
    
    const videoUrl = `/matches/${matchId}.mp4`;
    await runSql(`UPDATE matches SET status = 'succeed', video_url = '${videoUrl}' WHERE id = '${matchId}'`);
    
    console.log(`Match ${matchId} completed successfully!`);
    
  } catch (error) {
    console.error(`Error processing match ${matchId}:`, error);
    await runSql(`UPDATE matches SET status = 'failed' WHERE id = '${matchId}'`);
  }
}

const matchId = process.argv[2];
if (matchId) {
  processMatch(matchId);
} else {
  console.error('No matchId provided');
}
