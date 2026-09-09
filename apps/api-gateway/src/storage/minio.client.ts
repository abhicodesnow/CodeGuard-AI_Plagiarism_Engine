/**
 * MinIO client singleton.
 *
 * Provides a configured MinIO SDK client for object storage operations.
 * Used by the upload handler (streaming ZIPs) and resolvers (reading results).
 */
import * as Minio from 'minio';

const client = new Minio.Client({
  endPoint: (process.env.MINIO_ENDPOINT || 'localhost').trim(),
  port: parseInt((process.env.MINIO_PORT || '9000').toString().trim(), 10),
  useSSL: (process.env.MINIO_USE_SSL || 'false').trim() === 'true',
  accessKey: (process.env.MINIO_ACCESS_KEY || 'codeguard').trim(),
  secretKey: (process.env.MINIO_SECRET_KEY || 'codeguard-secret').trim(),
  region: 'us-east-1'
});

export const minioClient = client;

export function getMinioClient(): Minio.Client {
  return client;
}

export const BUCKET_SUBMISSIONS = (process.env.MINIO_BUCKET_SUBMISSIONS || 'codeguard-submissions').trim();
export const BUCKET_REPORTS = (process.env.MINIO_BUCKET_REPORTS || 'codeguard-reports').trim();