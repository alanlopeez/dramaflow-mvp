import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';
import { GCS_BUCKET_NAME, GCP_PROJECT_ID, getGcpServiceAccountKeyPath } from './gcp-config';

let storage: Storage | null = null;

try {
  const keyPath = getGcpServiceAccountKeyPath();
  if (keyPath) {
    storage = new Storage({ keyFilename: keyPath, projectId: GCP_PROJECT_ID });
    console.log(`☁️ Google Cloud Storage initialized with service account: ${keyPath}`);
  } else {
    storage = new Storage({ projectId: GCP_PROJECT_ID });
  }
} catch (e) {
  console.warn('GCS Storage initialized with fallback:', e);
}

/**
 * Uploads a local file to Google Cloud Storage and returns its accessible URL
 */
export async function uploadFileToGCS(
  localFilePath: string,
  destinationFilename: string,
  contentType: string = 'video/mp4'
): Promise<string> {
  if (!fs.existsSync(localFilePath)) {
    throw new Error(`File not found for GCS upload: ${localFilePath}`);
  }

  if (storage) {
    try {
      const bucket = storage.bucket(GCS_BUCKET_NAME);
      await bucket.upload(localFilePath, {
        destination: destinationFilename,
        metadata: {
          contentType: contentType,
          cacheControl: 'public, max-age=31536000',
        },
      });

      console.log(`☁️ Uploaded ${destinationFilename} to GCS bucket ${GCS_BUCKET_NAME}`);
      return `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${destinationFilename}`;
    } catch (gcsError) {
      console.error('Failed to upload to Google Cloud Storage:', gcsError);
    }
  }

  // Fallback to local URL path
  return `/videos/${path.basename(localFilePath)}`;
}

export async function getSignedMediaUrl(filename: string, action: 'read' | 'write' = 'read'): Promise<string> {
  if (storage) {
    try {
      const bucket = storage.bucket(GCS_BUCKET_NAME);
      const file = bucket.file(filename);

      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: action,
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      });

      return url;
    } catch (e) {
      console.error('Failed to get signed GCS URL:', e);
    }
  }

  return `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${filename}`;
}
