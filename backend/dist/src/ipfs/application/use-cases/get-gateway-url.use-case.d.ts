import { IpfsClientPort } from "../../domain/ipfs-client.port";
export declare class GetGatewayUrlUseCase {
    private readonly ipfsClient;
    constructor(ipfsClient: IpfsClientPort);
    execute(hash: string): string;
}
