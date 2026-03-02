import { CompleteOrderParams, OrderRepositoryPort } from "../../domain/order.repository";
import { PrismaService } from "../../../prisma/prisma.service";
import { ProductService } from "../../../product/product.service";
export declare class ConfirmOrderCompleteUseCase {
    private readonly repository;
    private readonly prisma;
    private readonly product;
    constructor(repository: OrderRepositoryPort, prisma: PrismaService, product: ProductService);
    execute(params: CompleteOrderParams): Promise<{
        ok: boolean;
        recipientAddress?: string;
    }>;
}
