import { Inject, Injectable } from "@nestjs/common";
import {
  IPFS_CLIENT,
  IpfsClientPort,
  IpfsFileUpload,
  IpfsUploadResult,
} from "../../domain/ipfs-client.port";

@Injectable()
export class UploadFileUseCase {
  constructor(
    @Inject(IPFS_CLIENT)
    private readonly ipfsClient: IpfsClientPort
  ) {}

  execute(file: IpfsFileUpload): Promise<IpfsUploadResult> {
    return this.ipfsClient.uploadFile(file);
  }
}

