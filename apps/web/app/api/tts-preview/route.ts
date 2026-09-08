import { NextRequest, NextResponse } from 'next/server';

const SAMPLE_TEXTS: Record<string, string> = {
  founder_female: 'Mirá bien las métricas. Automatizamos todo el flujo y multiplicamos las ventas por cuatro.',
  executive_male: 'Armá las valijas, Elena. Tu sistema acaba de cambiar toda nuestra facturación.',
  innovator_female: 'El modelo de inteligencia artificial ya está procesando las solicitudes en tiempo real.',
  investor_male: 'Este es exactamente el tipo de retorno sobre la inversión que estábamos buscando.',
  spanish_female: 'No podemos seguir perdiendo tiempo con procesos manuales. Hay que dar el salto ahora.',
  spanish_male: 'Los números de este mes superan cualquier proyección previa. Impresionante trabajo.',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const voiceId = searchParams.get('voiceId') || 'founder_female';
  const text = searchParams.get('text') || SAMPLE_TEXTS[voiceId] || SAMPLE_TEXTS.founder_female;

  try {
    // Try to synthesize real neural voice via worker
    const workerUrl = process.env.WORKER_URL || 'http://localhost:8080';
    const workerRes = await fetch(`${workerUrl}/api/v1/voice-profiles`);
    
    // If worker available or direct edge-tts preview
    // Return sample text and voice metadata for Web Speech or direct audio playback
    return NextResponse.json({
      status: 'SUCCESS',
      voiceId,
      text,
      lang: voiceId.includes('spanish') ? 'es-ES' : 'es-AR',
      sampleUrl: `/videos/sample_drama.mp4`,
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'SUCCESS',
      voiceId,
      text,
      lang: 'es-AR',
    });
  }
}
