import { Module } from "@nestjs/common";
import { ConfigModule } from "../config/config.module";
import { MultisigService } from "./multisig.service";
import { MultisigController } from "./multisig.controller";

@Module({
  imports: [ConfigModule],
  controllers: [MultisigController],
  providers: [MultisigService],
  exports: [MultisigService],
})
export class MultisigModule {}
