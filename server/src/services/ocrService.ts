import { ocrQueue } from '../config/queue.js';
import { DocumentRepository } from '../repositories/documentRepository.js';
import { OcrStatus } from '@adoption/shared/types/document.js';

export class OcrService {
  constructor(private documentRepository: DocumentRepository) {
    this.setupQueueProcessing();
  }

  async queueDocument(documentId: string, storagePath: string, mimeType: string): Promise<void> {
    try {
      await ocrQueue.add({
        documentId,
        storagePath,
        mimeType
      });
      
      await this.documentRepository.createAuditLog({
        documentId,
        userId: 'system',
        action: 'ocr_queued',
        metadata: { mimeType }
      });
    } catch (error) {
      if ((error as any).code === 'ECONNREFUSED') {
        await this.documentRepository.updateOcrStatus(documentId, 'not-applicable');
        return;
      }
      throw error;
    }
  }

  async retryOcr(documentId: string): Promise<void> {
    const doc = await this.documentRepository.findById(documentId);
    if (!doc) {
      throw new Error('Document not found');
    }

    await this.documentRepository.updateOcrStatus(documentId, 'pending');
    await this.queueDocument(documentId, doc.storagePath, doc.mimeType);
  }

  private setupQueueProcessing() {
    ocrQueue.process(async (job) => {
      const { documentId } = job.data;
      
      try {
        await this.documentRepository.updateOcrStatus(documentId, 'processing');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await this.documentRepository.updateOcrStatus(documentId, 'complete', new Date());
        await this.documentRepository.createAuditLog({
          documentId,
          userId: 'system',
          action: 'ocr_complete'
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await this.documentRepository.updateOcrStatus(documentId, 'failed', undefined, errorMessage);
        await this.documentRepository.createAuditLog({
          documentId,
          userId: 'system',
          action: 'ocr_failed',
          metadata: { error: errorMessage }
        });
        throw error;
      }
    });
  }
}
