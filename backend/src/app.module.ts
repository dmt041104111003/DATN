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
import { ProductController } from './product/product.controller';
import { ProductService } from './product/product.service';
import { ProductContractController } from './product/product.contract.controller';
import { ProductContractService } from './product/product.contract.service';
import { ProductRetireController } from './product/product.retire.controller';
import { TraceController } from './trace/trace.controller';
import { TraceService } from './trace/trace.service';
import { WarehouseController } from './warehouse/warehouse.controller';
import { WarehouseService } from './warehouse/warehouse.service';
import { MediaController } from './media/media.controller';
import { HealthController } from './health/health.controller';
import { GrowingAreaController } from './growing-area/growing-area.controller';
import { GrowingAreaService } from './growing-area/growing-area.service';
import { GrowingAreaContractController } from './growing-area/growing-area.contract.controller';
import { GrowingAreaContractService } from './growing-area/growing-area.contract.service';
import { GrowingAreaRetireController } from './growing-area/growing-area.retire.controller';
import { RecordOperationController } from './record-operation/record-operation.controller';
import { RecordOperationVerifierService } from './record-operation/record-operation.verifier.service';
import { PlanController } from './plan/plan.controller';
import { PlanService } from './plan/plan.service';
import { PlanContractController } from './plan/plan.contract.controller';
import { PlanContractService } from './plan/plan.contract.service';
import { PlanRetireController } from './plan/plan.retire.controller';
import { ProductionController } from './production/production.controller';
import { ProductionService } from './production/production.service';
import { ProductionContractController } from './production/production.contract.controller';
import { ProductionContractService } from './production/production.contract.service';
import { UnitController } from './unit/unit.controller';
import { UnitService } from './unit/unit.service';

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
    ProductController,
    ProductContractController,
    TraceController,
    WarehouseController,
    MediaController,
    ProductRetireController,
    RecordOperationController,
    GrowingAreaController,
    GrowingAreaContractController,
    GrowingAreaRetireController,
    PlanController,
    PlanContractController,
    PlanRetireController,
    ProductionController,
    ProductionContractController,
    UnitController,
    HealthController,
  ],
  providers: [
    AuthService,
    PrismaService,
    ProfileService,
    JwtStrategy,
    ProductService,
    ProductContractService,
    TraceService,
    WarehouseService,
    GrowingAreaService,
    GrowingAreaContractService,
    RecordOperationVerifierService,
    PlanService,
    PlanContractService,
    ProductionService,
    ProductionContractService,
    UnitService,
  ],
})
export class AppModule {}
