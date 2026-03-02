import { Inject, Injectable } from "@nestjs/common";
import { IPFS_CLIENT, IpfsClientPort, IpfsFileUpload } from "./domain/ipfs-client.port";
import { UploadFileUseCase } from "./application/use-cases/upload-file.use-case";
import { GetGatewayUrlUseCase } from "./application/use-cases/get-gateway-url.use-case";

@Injectable()
export class IpfsService {
  constructor(
    @Inject(IPFS_CLIENT)
    private readonly ipfsClient: IpfsClientPort,
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly getGatewayUrlUseCase: GetGatewayUrlUseCase
  ) {}

  getGatewayUrl(hash: string): string {
    return this.getGatewayUrlUseCase.execute(hash);
  }

  async uploadFile(file: IpfsFileUpload): Promise<{ ipfsHash: string; pinSize: number }> {
    return this.uploadFileUseCase.execute(file);
  }
}
