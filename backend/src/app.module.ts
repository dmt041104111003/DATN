import { Module } from "@nestjs/common";
import { ConfigModule } from "./config/config.module";
import { PrismaModule } from "./prisma/prisma.module";
import { CardanoModule } from "./cardano/cardano.module";
import { Cip68Module } from "./cip68/cip68.module";
import { TraceModule } from "./trace/trace.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [ConfigModule, PrismaModule, CardanoModule, Cip68Module, TraceModule, AuthModule],
})
export class AppModule {}
