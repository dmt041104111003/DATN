export declare class MediaController {
    upload(_req: any, file: any, _body: any): Promise<{
        ipfsHash: string;
        ipfsUri: string;
    }>;
}
