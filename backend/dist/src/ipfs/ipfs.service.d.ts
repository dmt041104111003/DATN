import { IpfsClientPort, IpfsFileUpload } from "./domain/ipfs-client.port";
import { UploadFileUseCase } from "./application/use-cases/upload-file.use-case";
import { GetGatewayUrlUseCase } from "./application/use-cases/get-gateway-url.use-case";
export declare class IpfsService {
    private readonly ipfsClient;
    private readonly uploadFileUseCase;
    private readonly getGatewayUrlUseCase;
    constructor(ipfsClient: IpfsClientPort, uploadFileUseCase: UploadFileUseCase, getGatewayUrlUseCase: GetGatewayUrlUseCase);
    getGatewayUrl(hash: string): string;
    uploadFile(file: IpfsFileUpload): Promise<{
        ipfsHash: string;
        pinSize: number;
    }>;
}
