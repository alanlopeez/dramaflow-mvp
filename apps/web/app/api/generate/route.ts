import { NextRequest, NextResponse } from 'next/server';
import { generateDramaScriptWithGemini } from '@/lib/gcp-vertex';
import { sql } from '@/lib/neon-db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      niche,
      valueProp,
      archetype,
      customInstructions,
      targetAudience,
      model,
      customCharacters,
      customProps,
      customLocations
    } = body;

    const script = await generateDramaScriptWithGemini(
      niche || 'Agencias de Marketing y Crecimiento',
      valueProp || 'Proceso de conversión 2 en 1 que duplica ventas en 48h',
      archetype || 'Fundador Subestimado vs Cliente Escéptico',
      customInstructions || '',
      targetAudience || 'Dueños de negocios que buscan escalar',
      customCharacters,
      customProps,
      customLocations,
      model || 'google/gemini-2.0-flash-001'
    );

    const projectId = `proj_${Date.now()}`;

    // Persist generated script and project in Neon PostgreSQL
    try {
      await sql`
        INSERT INTO projects (id, user_id, title, niche, archetype, script_payload)
        VALUES (
          ${projectId},
          'usr_beta_001',
          ${script.title || `${niche} - ${archetype}`},
          ${niche || 'General'},
          ${archetype || 'Viral Hook'},
          ${JSON.stringify(script)}::jsonb
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    } catch (dbErr) {
      console.warn('Neon save project warning:', dbErr);
    }

    return NextResponse.json({
      status: 'SUCCESS',
      project_id: projectId,
      data: script,
    });
  } catch (error: any) {
    console.error('API /generate error:', error);
    return NextResponse.json(
      { status: 'ERROR', message: error.message || 'Script generation failed' },
      { status: 500 }
    );
  }
}
