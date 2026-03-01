import { AuthService } from "../auth/auth.service";
import { IpfsService } from "./ipfs.service";
export declare class IpfsController {
    private readonly ipfs;
    private readonly auth;
    constructor(ipfs: IpfsService, auth: AuthService);
    upload(file: {
        buffer: Buffer;
        originalname?: string;
        mimetype?: string;
    } | undefined, token?: string): Promise<{
        ipfsHash: string;
    }>;
    getGatewayUrl(hash: string): {
        url: string;
    };
}
