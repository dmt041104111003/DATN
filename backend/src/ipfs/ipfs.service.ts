import { Injectable, BadRequestException } from '@nestjs/common';
import PinataClient from '@pinata/sdk';

@Injectable()
export class IpfsService {
  private pinata: PinataClient;

  constructor() {
    const apiKey = process.env.PINATA_API_KEY;
    const secretKey = process.env.PINATA_SECRET_KEY;

    if (!apiKey || !secretKey) {
      console.warn(
        'PINATA_API_KEY or PINATA_SECRET_KEY not set. IPFS upload will be disabled.',
      );
    } else {
      this.pinata = new PinataClient(apiKey, secretKey);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    metadata?: { name?: string },
  ): Promise<{ cid: string; url: string }> {
    if (!this.pinata) {
      throw new BadRequestException(
        'IPFS service not configured. Set PINATA_API_KEY and PINATA_SECRET_KEY.',
      );
    }

    try {
      const { Readable } = await import('stream');
      const readableStream = Readable.from(file.buffer);

      const options = {
        pinataMetadata: {
          name: metadata?.name || file.originalname,
        },
      };

      const result = await this.pinata.pinFileToIPFS(readableStream, options);
      const cid = result.IpfsHash;
      const url = `ipfs://${cid}`;

      return { cid, url };
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new BadRequestException('Failed to upload file to IPFS');
    }
  }

  async uploadJson(
    data: Record<string, unknown>,
    metadata?: { name?: string },
  ): Promise<{ cid: string; url: string }> {
    if (!this.pinata) {
      throw new BadRequestException('IPFS service not configured');
    }

    try {
      const options = {
        pinataMetadata: {
          name: metadata?.name || 'metadata.json',
        },
      };

      const result = await this.pinata.pinJSONToIPFS(data, options);
      const cid = result.IpfsHash;
      const url = `ipfs://${cid}`;

      return { cid, url };
    } catch (error) {
      console.error('IPFS JSON upload error:', error);
      throw new BadRequestException('Failed to upload JSON to IPFS');
    }
  }

  async unpin(cid: string): Promise<void> {
    if (!this.pinata) return;

    try {
      await this.pinata.unpin(cid);
    } catch (error) {
      console.error('IPFS unpin error:', error);
    }
  }

  toGatewayUrl(ipfsUrl: string): string {
    if (ipfsUrl.startsWith('ipfs://')) {
      const cid = ipfsUrl.replace('ipfs://', '');
      return `https://gateway.pinata.cloud/ipfs/${cid}`;
    }
    return ipfsUrl;
  }
}
