import { ConfigService } from "../config/config.service";
export declare class IpfsService {
    private readonly config;
    private readonly pinata;
    constructor(config: ConfigService);
    getGatewayUrl(hash: string): string;
    uploadFile(file: {
        buffer: Buffer;
        originalname?: string;
        mimetype?: string;
    }): Promise<{
        ipfsHash: string;
        pinSize: number;
    }>;
}
