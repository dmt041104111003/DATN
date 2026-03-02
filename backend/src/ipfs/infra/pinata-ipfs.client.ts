import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "../../core/config/config.service";
import { IpfsClientPort, IpfsFileUpload, IpfsUploadResult } from "../domain/ipfs-client.port";
import { PinataSDK } from "pinata";

@Injectable()
export class PinataIpfsClient implements IpfsClientPort {
  private readonly pinata: PinataSDK | null = null;

  constructor(private readonly config: ConfigService) {
    const jwt = this.config.pinataJwt;
    if (jwt) {
      this.pinata = new PinataSDK({
        pinataJwt: jwt,
        pinataGateway: this.config.pinataGateway,
      });
    }
  }

  getGatewayUrl(hash: string): string {
    const clean = (hash || "").trim().replace(/^ipfs:\/\//, "");
    if (!clean) return "";
    if (clean.startsWith("http://") || clean.startsWith("https://")) {
      return clean;
    }
    const base =
      this.config.pinataGateway
        ? `https://${this.config.pinataGateway
            .replace(/^https?:\/\//, "")
            .replace(/\/$/, "")}`
        : this.config.ipfsGateway.replace(/\/$/, "");
    return `${base}/ipfs/${clean}`;
  }

  async uploadFile(file: IpfsFileUpload): Promise<IpfsUploadResult> {
    if (!this.pinata) {
      throw new BadRequestException(
        "IPFS (Pinata) chưa cấu hình. Thêm PINATA_JWT vào .env (tạo tại pinata.cloud → API Keys).",
      );
    }

    const buffer = file.buffer;
    const filename = file.originalname ?? "file";
    const mimetype = file.mimetype ?? "application/octet-stream";
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException("No file content provided.");
    }

    try {
      const fileObj = new File([buffer], filename, { type: mimetype });
      const upload = await this.pinata.upload.public.file(fileObj);

      return {
        ipfsHash: upload.cid ?? "",
        pinSize: upload.size ?? 0,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new BadRequestException(`IPFS upload failed: ${msg}`);
    }
  }
}

