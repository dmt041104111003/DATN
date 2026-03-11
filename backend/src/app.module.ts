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
import { AssetController } from './asset/asset.controller';
import { AssetService } from './asset/asset.service';
import { ContractController } from './contract/contract.controller';
import { ContractService } from './contract/contract.service';
import { TraceController } from './trace/trace.controller';
import { TraceService } from './trace/trace.service';
import { WarehouseController } from './warehouse/warehouse.controller';
import { WarehouseService } from './warehouse/warehouse.service';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';
import { BurnController } from './burn/burn.controller';
import { BurnService } from './burn/burn.service';
import { AssetImageController } from './asset-image/asset-image.controller';
import { AssetImageService } from './asset-image/asset-image.service';
import { ProducerController } from './producer/producer.controller';
import { ProducerService } from './producer/producer.service';
import { ProductTypeController } from './product-type/product-type.controller';
import { ProductTypeService } from './product-type/product-type.service';
import { CertificationController } from './certification/certification.controller';
import { CertificationService } from './certification/certification.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController, ProfileController, AssetController, ContractController, TraceController, WarehouseController, OrderController, BurnController, AssetImageController, ProducerController, ProductTypeController, CertificationController],
  providers: [AuthService, PrismaService, ProfileService, JwtStrategy, AssetService, ContractService, TraceService, WarehouseService, OrderService, BurnService, AssetImageService, ProducerService, ProductTypeService, CertificationService],
})
export class AppModule {}
