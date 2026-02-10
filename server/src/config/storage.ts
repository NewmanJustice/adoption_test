import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { Readable } from 'stream';

export interface StorageAdapter {
  uploadFile(filename: string, buffer: Buffer, mimeType: string): Promise<string>;
  downloadFile(storagePath: string): Promise<Buffer>;
  deleteFile(storagePath: string): Promise<void>;
  generateSignedUrl(storagePath: string, expiryMinutes: number): Promise<string>;
}

class LocalFileStorageAdapter implements StorageAdapter {
  private readonly baseDir: string;

  constructor(baseDir: string = process.env.UPLOAD_DIR || './uploads') {
    this.baseDir = baseDir;
  }

  async uploadFile(filename: string, buffer: Buffer, mimeType: string): Promise<string> {
    await fs.mkdir(this.baseDir, { recursive: true });
    const storagePath = path.join(this.baseDir, filename);
    await fs.writeFile(storagePath, buffer);
    return filename;
  }

  async downloadFile(storagePath: string): Promise<Buffer> {
    const fullPath = path.join(this.baseDir, storagePath);
    return await fs.readFile(fullPath);
  }

  async deleteFile(storagePath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, storagePath);
    await fs.unlink(fullPath);
  }

  async generateSignedUrl(storagePath: string, expiryMinutes: number): Promise<string> {
    return `/api/documents/download/${encodeURIComponent(storagePath)}`;
  }
}

export const storage: StorageAdapter = new LocalFileStorageAdapter();
