import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');

  // If projectId is 'new' or 'nuevo', fallback to active rendered minidrama or master
  const effectiveId = (!projectId || projectId === 'nuevo' || projectId === 'new') ? 'active_minidrama' : projectId;

  const voiceId = searchParams.get('voiceId');

  // Check actual rendered project videos or master 1080p complete minidrama
  const possiblePaths = [
    ...(voiceId ? [path.join(process.cwd(), 'public', 'videos', `dramaflow_${voiceId}_1080p.mp4`)] : []),
    path.join(process.cwd(), 'public', 'videos', 'dramaflow_active_minidrama_1080p.mp4'),
    path.join(process.cwd(), 'public', 'videos', `dramaflow_${effectiveId}_1080p.mp4`),
    path.join(process.cwd(), 'public', 'videos', `dramaflow_${effectiveId}.mp4`),
    path.join(process.cwd(), 'public', 'videos', 'dramaflow_proj_master_01.mp4'),
    path.join(process.cwd(), 'public', 'videos', 'sample_drama.mp4'),
    path.join(process.cwd(), 'public', 'videos', 'nexorouter_wan_drama.mp4'),
  ];

  let targetVideoPath = '';
  for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.statSync(p).size > 10000) {
      targetVideoPath = p;
      break;
    }
  }

  // Fallback seed if nothing found
  if (!targetVideoPath) {
    const publicVideosDir = path.join(process.cwd(), 'public', 'videos');
    const fallbackSeed = path.join(publicVideosDir, 'nexorouter_wan_drama.mp4');
    if (fs.existsSync(fallbackSeed)) {
      targetVideoPath = fallbackSeed;
    }
  }

  if (targetVideoPath && fs.existsSync(targetVideoPath)) {
    const fileBuffer = fs.readFileSync(targetVideoPath);
    const stat = fs.statSync(targetVideoPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': stat.size.toString(),
        'Accept-Ranges': 'bytes',
        'Content-Disposition': `attachment; filename="dramaflow_${effectiveId}_1080p.mp4"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }

  return NextResponse.json(
    { status: 'PROCESSING', message: 'El video todavía se está procesando. Por favor aguardá...' },
    { status: 202 }
  );
}
