import { ContainerService } from './container.service';
export declare class ContainerController {
    private readonly containerService;
    constructor(containerService: ContainerService);
    private getCustodian;
    private getRole;
    list(req: any): Promise<any>;
    capacitySummary(_req: any, productionInventoryKey: string, excludeContainerInventoryKey?: string): Promise<{
        productionInventoryKey: string;
        totalCapacityKg: number;
        usedCapacityKg: any;
        remainingCapacityKg: number;
    }>;
    create(req: any, body: any): Promise<any>;
    update(req: any, inventoryKey: string, body: any): Promise<any>;
    remove(req: any, inventoryKey: string, body: any): Promise<{
        inventoryKey: string;
        pendingDelete: boolean;
    }>;
}
