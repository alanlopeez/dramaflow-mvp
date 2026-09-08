import { neon, neonConfig } from '@neondatabase/serverless';

// Serverless Neon client

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_vn8VUpACk4sI@ep-delicate-queen-ae87sen3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

export const sql = neon(connectionString);

export interface DbUser {
  id: string;
  email: string;
  name: string;
  plan: string;
  credits_remaining: number;
  created_at: string;
}

export interface DbProject {
  id: string;
  user_id: string;
  title: string;
  niche: string;
  archetype: string;
  script_payload: any;
  created_at: string;
  updated_at: string;
}

export interface DbRenderJob {
  id: string;
  project_id: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  stage: string;
  engine: string;
  video_url: string | null;
  download_url: string | null;
  error: string | null;
  started_at: string;
  completed_at: string | null;
}

/**
 * Initializes Neon PostgreSQL tables for DramaFlow SaaS
 */
export async function initDatabaseSchema(): Promise<void> {
  try {
    // 1. Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        plan VARCHAR(50) DEFAULT 'pro',
        credits_remaining INTEGER DEFAULT 50,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 2. Projects table
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        niche VARCHAR(255),
        archetype VARCHAR(255),
        script_payload JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 3. Render Jobs table
    await sql`
      CREATE TABLE IF NOT EXISTS render_jobs (
        id VARCHAR(100) PRIMARY KEY,
        project_id VARCHAR(100) REFERENCES projects(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        progress INTEGER DEFAULT 0,
        stage TEXT,
        engine VARCHAR(100) DEFAULT 'google_vertex_veo2',
        video_url TEXT,
        download_url TEXT,
        error TEXT,
        started_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ
      );
    `;

    // 4. Default Beta Pioneer user
    await sql`
      INSERT INTO users (id, email, name, plan, credits_remaining)
      VALUES ('usr_beta_001', 'founder@dramaflow.ai', 'Beta Pioneer', 'pro', 50)
      ON CONFLICT (id) DO NOTHING;
    `;

    console.log('✅ Neon Database tables initialized successfully.');
  } catch (error) {
    console.error('❌ Failed to initialize Neon Database schema:', error);
    throw error;
  }
}
