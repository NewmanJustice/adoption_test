export interface AntivirusService {
  scanBuffer(buffer: Buffer, filename: string): Promise<{ isInfected: boolean; viruses?: string[] }>;
}

class MockAntivirusService implements AntivirusService {
  async scanBuffer(buffer: Buffer, filename: string): Promise<{ isInfected: boolean; viruses?: string[] }> {
    const content = buffer.toString('utf-8');
    const isEicar = content.includes('EICAR-STANDARD-ANTIVIRUS-TEST-FILE');
    
    if (isEicar) {
      return {
        isInfected: true,
        viruses: ['EICAR-Test-File']
      };
    }

    return { isInfected: false };
  }
}

export const antivirus: AntivirusService = new MockAntivirusService();
