import { NextRequest, NextResponse } from 'next/server';

const WORKER_URL = process.env.WORKER_URL || 'http://localhost:8080';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tool = searchParams.get('tool'); // 'trends' | 'voices' | 'public-apis' | 'live-context'
  const niche = searchParams.get('niche') || 'business';

  try {
    if (tool === 'trends') {
      const res = await fetch(`${WORKER_URL}/api/v1/trends?niche=${encodeURIComponent(niche)}`);
      if (res.ok) return NextResponse.json(await res.json());
    } else if (tool === 'voices') {
      const res = await fetch(`${WORKER_URL}/api/v1/voice/profiles`);
      if (res.ok) return NextResponse.json(await res.json());
    } else if (tool === 'public-apis') {
      const res = await fetch(`${WORKER_URL}/api/v1/public-apis`);
      if (res.ok) return NextResponse.json(await res.json());
    } else if (tool === 'live-context') {
      const res = await fetch(`${WORKER_URL}/api/v1/public-apis/live-context?niche=${encodeURIComponent(niche)}`);
      if (res.ok) return NextResponse.json(await res.json());
    }
  } catch (e) {
    // Fallback response for standalone local Next.js client
  }

  // Graceful fallback for offline / mock testing
  if (tool === 'voices') {
    return NextResponse.json({
      status: 'SUCCESS',
      profiles: [
        { id: 'founder_female', name: 'Elena (Founder)', role: 'Protagonist', gender: 'FEMALE' },
        { id: 'executive_male', name: 'Marcus (Exec)', role: 'Antagonist', gender: 'MALE' }
      ]
    });
  }

  return NextResponse.json({
    status: 'SUCCESS',
    data: {
      niche,
      urgency_trigger: '73% of businesses lose customers in first 60 seconds',
      psychological_hook: 'Status loss vs immediate competitive edge'
    }
  });
}
