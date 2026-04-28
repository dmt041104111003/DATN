import { WarehouseService } from './warehouse.service';
export declare class WarehouseController {
    private readonly warehouseService;
    constructor(warehouseService: WarehouseService);
    private getCustodian;
    list(req: any): Promise<any>;
    create(req: any, body: any): Promise<any>;
    update(req: any, id: string, body: any): Promise<any>;
    remove(req: any, id: string): Promise<{
        id: string;
    }>;
}
