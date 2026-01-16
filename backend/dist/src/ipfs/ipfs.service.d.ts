export declare class IpfsService {
    private pinata;
    constructor();
    uploadFile(file: Express.Multer.File, metadata?: {
        name?: string;
    }): Promise<{
        cid: string;
        url: string;
    }>;
    uploadJson(data: Record<string, unknown>, metadata?: {
        name?: string;
    }): Promise<{
        cid: string;
        url: string;
    }>;
    unpin(cid: string): Promise<void>;
    toGatewayUrl(ipfsUrl: string): string;
}
