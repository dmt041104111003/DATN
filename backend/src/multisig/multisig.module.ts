import { Module } from "@nestjs/common";
import { ConfigModule } from "../config/config.module";
import { PrismaModule } from "../prisma/prisma.module";
import { TraceModule } from "../trace/trace.module";
import { AuthModule } from "../auth/auth.module";
import { MultisigService } from "./multisig.service";
import { MultisigController } from "./multisig.controller";

@Module({
  imports: [ConfigModule, PrismaModule, TraceModule, AuthModule],
  controllers: [MultisigController],
  providers: [MultisigService],
  exports: [MultisigService],
})
export class MultisigModule {}
