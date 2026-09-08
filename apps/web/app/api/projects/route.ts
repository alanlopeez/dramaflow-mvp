import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon-db';

export async function GET() {
  try {
    const projectsWithJobs = await sql`
      SELECT 
        p.id,
        p.title,
        p.niche,
        p.archetype,
        p.created_at,
        p.script_payload,
        r.id as job_id,
        r.status as job_status,
        r.progress as job_progress,
        r.stage as job_stage,
        r.video_url,
        r.download_url,
        r.completed_at
      FROM projects p
      LEFT JOIN LATERAL (
        SELECT * FROM render_jobs 
        WHERE project_id = p.id 
        ORDER BY started_at DESC 
        LIMIT 1
      ) r ON true
      ORDER BY p.created_at DESC
      LIMIT 50;
    `;

    return NextResponse.json({
      status: 'SUCCESS',
      projects: projectsWithJobs,
    });
  } catch (error: any) {
    console.error('Failed to query projects from Neon:', error);
    return NextResponse.json(
      { status: 'ERROR', message: error.message || 'Could not fetch projects' },
      { status: 500 }
    );
  }
}
