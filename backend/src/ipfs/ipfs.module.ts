import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ConfigModule } from "../core/config/config.module";
import { IpfsController } from "./ipfs.controller";
import { IpfsService } from "./ipfs.service";
import { IPFS_CLIENT } from "./domain/ipfs-client.port";
import { PinataIpfsClient } from "./infra/pinata-ipfs.client";
import { UploadFileUseCase } from "./application/use-cases/upload-file.use-case";
import { GetGatewayUrlUseCase } from "./application/use-cases/get-gateway-url.use-case";

@Module({
  imports: [ConfigModule, AuthModule],
  providers: [
    IpfsService,
    {
      provide: IPFS_CLIENT,
      useClass: PinataIpfsClient,
    },
    UploadFileUseCase,
    GetGatewayUrlUseCase,
  ],
  controllers: [IpfsController],
  exports: [IpfsService],
})
export class IpfsModule {}
