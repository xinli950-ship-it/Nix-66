import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

export interface VideoSegment {
  videoUrl: string;
  audioUrl?: string;
  overlayText?: string;
  duration?: number;
}

export async function assembleVideo(matchId: string, segments: VideoSegment[]): Promise<string> {
  const workDir = path.join('/tmp', `match-${matchId}`);
  if (!fs.existsSync(workDir)) {
    fs.mkdirSync(workDir, { recursive: true });
  }

  const segmentPaths: string[] = [];
  const processedPaths: string[] = [];

  try {
    // 1. Download and normalize each segment
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const segmentPath = path.join(workDir, `segment-${i}.mp4`);
      const processedPath = path.join(workDir, `processed-${i}.mp4`);
      
      // Download video
      await execPromise(`curl -L "${segment.videoUrl}" -o "${segmentPath}"`);

      // Normalize video (ensure same resolution, frame rate, and pixel format)
      // We'll target 1080p, 30fps
      await execPromise(`ffmpeg -y -i "${segmentPath}" -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p" -r 30 -c:v libx264 -preset fast "${processedPath}"`);
      
      processedPaths.push(processedPath);
    }

    // 2. Create a concat list
    const listPath = path.join(workDir, 'list.txt');
    const listContent = processedPaths.map(p => `file '${p}'`).join('\n');
    fs.writeFileSync(listPath, listContent);

    // 3. Concatenate
    const stitchedPath = path.join(workDir, 'stitched.mp4');
    await execPromise(`ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${stitchedPath}"`);

    // 4. Mix Audio (if any)
    // For now, let's just return the stitched video
    // In a real scenario, we'd mix multiple audio streams
    
    // Move to public or shared storage
    const finalPath = path.join('/home/team/shared/dream-matches-web/public/matches', `${matchId}.mp4`);
    const publicDir = path.dirname(finalPath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.copyFileSync(stitchedPath, finalPath);
    
    return `/matches/${matchId}.mp4`;
  } catch (error) {
    console.error('Error assembling video:', error);
    throw error;
  } finally {
    // Cleanup workDir? Maybe keep for debugging for now
    // fs.rmSync(workDir, { recursive: true, force: true });
  }
}

export async function addOverlays(videoPath: string, overlays: { text: string, startTime: number, duration: number }[]): Promise<string> {
  // Implementation for adding text overlays using FFmpeg filters
  // Example: -vf "drawtext=text='Match Start':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,0,5)'"
  return videoPath;
}
