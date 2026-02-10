import Bull from 'bull';

interface OcrJobData {
  documentId: string;
  storagePath: string;
  mimeType: string;
}

// Only initialize queue if Redis is explicitly configured
const REDIS_ENABLED = process.env.REDIS_HOST && process.env.REDIS_HOST !== 'localhost';

export const ocrQueue = REDIS_ENABLED
  ? new Bull<OcrJobData>('ocr-processing', {
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
        retryStrategy: () => null
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    })
  : null;

process.on('SIGTERM', async () => {
  if (ocrQueue) {
    await ocrQueue.close();
  }
});
