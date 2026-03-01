import { Module } from "@nestjs/common";
import { ConfigModule } from "./config/config.module";
import { PrismaModule } from "./prisma/prisma.module";
import { CardanoModule } from "./cardano/cardano.module";
import { ProductModule } from "./product/product.module";
import { AuthModule } from "./auth/auth.module";
import { ProfileModule } from "./profile/profile.module";
import { OrderModule } from "./order/order.module";
import { WarehouseModule } from "./warehouse/warehouse.module";
import { CertificateModule } from "./certificate/certificate.module";
import { IpfsModule } from "./ipfs/ipfs.module";
import { UploadModule } from "./upload/upload.module";

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CardanoModule,
    ProductModule,
    AuthModule,
    ProfileModule,
    OrderModule,
    WarehouseModule,
    CertificateModule,
    IpfsModule,
    UploadModule,
  ],
})
export class AppModule {}
