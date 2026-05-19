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
import { ContractController } from './contract/contract.controller';
import { ContractService } from './contract/contract.service';
import { ContainerController } from './container/container.controller';
import { ContainerService } from './container/container.service';
import { LocationController } from './location/location.controller';
import { WarehouseController } from './warehouse/warehouse.controller';
import { WarehouseService } from './warehouse/warehouse.service';
import { WarehouseStorageController } from './warehouse-storage/warehouse-storage.controller';
import { WarehouseStorageService } from './warehouse-storage/warehouse-storage.service';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';

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
    ContractController,
    ContainerController,
    WarehouseController,
    WarehouseStorageController,
    DashboardController,
    HealthController,
    LocationController,
  ],
  providers: [
    AuthService,
    PrismaService,
    ProfileService,
    JwtStrategy,
    TraceService,
    RecordOperationVerifierService,
    ProductionService,
    ContractService,
    ContainerService,
    WarehouseService,
    WarehouseStorageService,
    DashboardService,
  ],
})
export class AppModule {}
