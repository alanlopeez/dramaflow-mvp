import { NextRequest, NextResponse } from 'next/server';
import { composeFullDramaMaster } from '@/lib/drama-master-compositor';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { script, voiceId = 'ejecutivo_latino', projectId = `proj_${Date.now()}` } = body;

    if (!script || !script.scenes || script.scenes.length === 0) {
      return NextResponse.json({ status: 'ERROR', message: 'No scenes provided' }, { status: 400 });
    }

    const result = await composeFullDramaMaster({
      script,
      voiceId,
      projectId,
    });

    return NextResponse.json({
      status: 'SUCCESS',
      projectId,
      message: 'Minidrama completo generado exitosamente con video real, subtítulos y voces de ElevenLabs.',
      masterVideoUrl: result.masterVideoUrl,
      data: {
        ...script,
        scenes: result.scenes,
      },
    });
  } catch (error: any) {
    console.error('API /render-drama error:', error);
    return NextResponse.json(
      { status: 'ERROR', message: error.message || 'Render failed' },
      { status: 500 }
    );
  }
}

