import { ProductionService } from './production.service';
export declare class ProductionController {
    private readonly productionService;
    constructor(productionService: ProductionService);
    private fail;
    list(): Promise<any>;
    create(req: any, body: any): Promise<any>;
    update(req: any, inventoryKey: string, body: any): Promise<any>;
    remove(inventoryKey: string, body: any): Promise<{
        inventoryKey: string;
        pendingDelete: boolean;
    }>;
}
