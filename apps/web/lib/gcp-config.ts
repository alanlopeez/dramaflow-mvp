import path from 'path';
import fs from 'fs';

export const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || 'dramaflow-508012';
export const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'gcs_bucket_name';
export const GCP_REGION = process.env.GCP_REGION || 'us-central1';

/**
 * Resolves the service account JSON file from workspace or environment variables
 */
export function getGcpServiceAccountKeyPath(): string | null {
  const candidates = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    path.join(process.cwd(), 'dramaflow-508012-a00a72dcff1e.json'),
    path.join(process.cwd(), '..', '..', 'dramaflow-508012-a00a72dcff1e.json'),
    path.join(process.cwd(), '..', 'dramaflow-508012-a00a72dcff1e.json'),
    path.join(__dirname, '..', '..', '..', 'dramaflow-508012-a00a72dcff1e.json'),
  ];

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return path.resolve(candidate);
    }
  }

  return null;
}
