import { ConfigService } from "../../../core/config/config.service";
import { CardanoService } from "../../../core/cardano/cardano.service";
import { PrismaService } from "../../../prisma/prisma.service";
import { OrderService } from "../../../order/order.service";
import type { TraceResponse } from "../../domain/trace.types";
export declare class TraceAssetUseCase {
    private readonly config;
    private readonly cardano;
    private readonly prisma;
    private readonly order;
    constructor(config: ConfigService, cardano: CardanoService, prisma: PrismaService, order: OrderService);
    execute(policyId: string, assetName: string): Promise<TraceResponse>;
}
