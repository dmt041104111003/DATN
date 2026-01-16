import { ServiceService } from './service.service';
export declare class ServiceController {
    private serviceService;
    constructor(serviceService: ServiceService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        price: number;
        duration: number;
        maxProducts: number | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        price: number;
        duration: number;
        maxProducts: number | null;
    }>;
}
