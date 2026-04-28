import { WarehouseStorageService } from './warehouse-storage.service';
export declare class WarehouseStorageController {
    private readonly warehouseStorageService;
    constructor(warehouseStorageService: WarehouseStorageService);
    private getCustodian;
    private getRole;
    list(req: any): Promise<any>;
    create(req: any, body: any): Promise<any>;
    update(req: any, id: string, body: any): Promise<any>;
    remove(req: any, id: string, body: any): Promise<{
        id: string;
        deleted: boolean;
        txHash: string;
    }>;
}
