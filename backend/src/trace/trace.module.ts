import { Module } from "@nestjs/common";
import { CardanoModule } from "../cardano/cardano.module";
import { AuthModule } from "../auth/auth.module";
import { TraceService } from "./trace.service";
import { TraceController } from "./trace.controller";

@Module({
  imports: [CardanoModule, AuthModule],
  controllers: [TraceController],
  providers: [TraceService],
  exports: [TraceService],
})
export class TraceModule {}
