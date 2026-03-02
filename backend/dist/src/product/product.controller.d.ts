import { ProductService } from "./product.service";
import { AuthService } from "../auth/auth.service";
import { MintProductDto, UpdateProductDto, RevokeProductDto, BurnProductDto, MintConfirmDto, UpdateConfirmDto, RevokeConfirmDto, BurnConfirmDto, SubmitTxDto } from "./dto/product.dto";
export declare class ProductController {
    private readonly product;
    private readonly auth;
    constructor(product: ProductService, auth: AuthService);
    listBatches(token?: string): Promise<{
        total: number;
        items: {
            id: number;
            code: string;
            name: string;
            description: string | null;
            image: string | null;
            createdAt: Date;
            policyId: string | null;
        }[];
    }>;
    mint(body: MintProductDto, token?: string): Promise<{
        unsignedTx: string;
        policyId?: string;
    }>;
    update(body: UpdateProductDto, token?: string): Promise<{
        unsignedTx: string;
    }>;
    revoke(body: RevokeProductDto, token?: string): Promise<{
        unsignedTx: string;
    }>;
    burn(body: BurnProductDto): Promise<{
        unsignedTx: string;
    }>;
    mintConfirm(body: MintConfirmDto, token?: string): Promise<{
        ok: boolean;
    }>;
    updateConfirm(body: UpdateConfirmDto, token?: string): Promise<{
        ok: boolean;
    }>;
    revokeConfirm(body: RevokeConfirmDto, token?: string): Promise<{
        ok: boolean;
    }>;
    burnConfirm(body: BurnConfirmDto): Promise<{
        ok: boolean;
    }>;
    submit(body: SubmitTxDto): Promise<{
        txHash: string;
    }>;
    getRoadmap(code: string | undefined, token?: string): Promise<{
        items: {
            hopIndex: number;
            receiverAddress: string | null;
        }[];
    }>;
}
