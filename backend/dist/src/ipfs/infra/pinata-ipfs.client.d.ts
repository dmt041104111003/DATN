import { ConfigService } from "../../core/config/config.service";
import { IpfsClientPort, IpfsFileUpload, IpfsUploadResult } from "../domain/ipfs-client.port";
export declare class PinataIpfsClient implements IpfsClientPort {
    private readonly config;
    private readonly pinata;
    constructor(config: ConfigService);
    getGatewayUrl(hash: string): string;
    uploadFile(file: IpfsFileUpload): Promise<IpfsUploadResult>;
}
