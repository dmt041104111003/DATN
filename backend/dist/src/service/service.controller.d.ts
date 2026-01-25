import { ServiceService } from './service.service';
export declare class ServiceController {
    private serviceService;
    constructor(serviceService: ServiceService);
    findAll(): Promise<string | {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
        duration: number;
        maxProducts: number | null;
    }[]>;
    findOne(id: string): Promise<string | {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
        duration: number;
        maxProducts: number | null;
    }>;
}
