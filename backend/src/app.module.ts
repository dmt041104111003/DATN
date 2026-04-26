import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { PrismaService } from './prisma/prisma.service';
import { ProfileController } from './profile/profile.controller';
import { ProfileService } from './profile/profile.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { TraceController } from './trace/trace.controller';
import { TraceService } from './trace/trace.service';
import { MediaController } from './media/media.controller';
import { HealthController } from './health/health.controller';
import { RecordOperationController } from './record-operation/record-operation.controller';
import { RecordOperationVerifierService } from './record-operation/record-operation.verifier.service';
import { ProductionController } from './production/production.controller';
import { ProductionService } from './production/production.service';
import { ProductionContractController } from './production/production.contract.controller';
import { ProductionContractService } from './production/production.contract.service';
import { PackageController } from './package/package.controller';
import { PackageService } from './package/package.service';
import { PackageContractController } from './package/package.contract.controller';
import { PackageContractService } from './package/package.contract.service';
import { ShipmentController } from './shipment/shipment.controller';
import { ShipmentService } from './shipment/shipment.service';
import { ShipmentContractController } from './shipment/shipment.contract.controller';
import { ShipmentContractService } from './shipment/shipment.contract.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [
    AuthController,
    ProfileController,
    TraceController,
    MediaController,
    RecordOperationController,
    ProductionController,
    ProductionContractController,
    PackageController,
    PackageContractController,
    ShipmentController,
    ShipmentContractController,
    HealthController,
  ],
  providers: [
    AuthService,
    PrismaService,
    ProfileService,
    JwtStrategy,
    TraceService,
    RecordOperationVerifierService,
    ProductionService,
    ProductionContractService,
    PackageService,
    PackageContractService,
    ShipmentService,
    ShipmentContractService,
  ],
})
export class AppModule {}
