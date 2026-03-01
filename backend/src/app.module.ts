import { Module } from "@nestjs/common";
import { ConfigModule } from "./config/config.module";
import { PrismaModule } from "./prisma/prisma.module";
import { CardanoModule } from "./cardano/cardano.module";
import { TraceModule } from "./trace/trace.module";
import { AuthModule } from "./auth/auth.module";
import { MultisigModule } from "./multisig/multisig.module";

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CardanoModule,
    TraceModule,
    AuthModule,
    MultisigModule,
  ],
})
export class AppModule {}
