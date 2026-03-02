import { IpfsClientPort, IpfsFileUpload, IpfsUploadResult } from "../../domain/ipfs-client.port";
export declare class UploadFileUseCase {
    private readonly ipfsClient;
    constructor(ipfsClient: IpfsClientPort);
    execute(file: IpfsFileUpload): Promise<IpfsUploadResult>;
}
