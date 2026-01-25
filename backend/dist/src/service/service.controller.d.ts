import { ServiceService } from './service.service';
export declare class ServiceController {
    private serviceService;
    constructor(serviceService: ServiceService);
    findAll(): Promise<string | {
        id: string;
        name: string;
        description: string | null;
        price: number;
        duration: number;
        maxProducts: number | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<string | {
        id: string;
        name: string;
        description: string | null;
        price: number;
        duration: number;
        maxProducts: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
