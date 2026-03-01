import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ConfigModule } from "../config/config.module";
import { IpfsController } from "./ipfs.controller";
import { IpfsService } from "./ipfs.service";

@Module({
  imports: [ConfigModule, AuthModule],
  providers: [IpfsService],
  controllers: [IpfsController],
  exports: [IpfsService],
})
export class IpfsModule {}
