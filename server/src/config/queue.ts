import Bull from 'bull';

interface OcrJobData {
  documentId: string;
  storagePath: string;
  mimeType: string;
}

export const ocrQueue = new Bull<OcrJobData>('ocr-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    retryStrategy: () => null
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

process.on('SIGTERM', async () => {
  await ocrQueue.close();
});
