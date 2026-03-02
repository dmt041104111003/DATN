import { Inject, Injectable } from "@nestjs/common";
import { IPFS_CLIENT, IpfsClientPort } from "../../domain/ipfs-client.port";

@Injectable()
export class GetGatewayUrlUseCase {
  constructor(
    @Inject(IPFS_CLIENT)
    private readonly ipfsClient: IpfsClientPort
  ) {}

  execute(hash: string): string {
    return this.ipfsClient.getGatewayUrl(hash);
  }
}

