const { neon } = require('@neondatabase/serverless');

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_vn8VUpACk4sI@ep-delicate-queen-ae87sen3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(connectionString);

async function runMigration() {
  console.log('Connecting to Neon PostgreSQL...');
  try {
    const ping = await sql`SELECT NOW() as server_time, version() as pg_version`;
    console.log('✅ Connection verified:', ping[0]);

    console.log('Creating users table...');
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

    console.log('Creating projects table...');
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

    console.log('Creating render_jobs table...');
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

    console.log('Seeding default user...');
    await sql`
      INSERT INTO users (id, email, name, plan, credits_remaining)
      VALUES ('usr_beta_001', 'founder@dramaflow.ai', 'Beta Pioneer', 'pro', 50)
      ON CONFLICT (id) DO NOTHING;
    `;

    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log('✅ Tables present in Neon database:', tables.map(t => t.table_name));
    console.log('🚀 Neon migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
