export interface IpfsFileUpload {
    buffer: Buffer;
    originalname?: string;
    mimetype?: string;
}
export interface IpfsUploadResult {
    ipfsHash: string;
    pinSize: number;
}
export interface IpfsClientPort {
    getGatewayUrl(hash: string): string;
    uploadFile(file: IpfsFileUpload): Promise<IpfsUploadResult>;
}
export declare const IPFS_CLIENT = "IPFS_CLIENT";
