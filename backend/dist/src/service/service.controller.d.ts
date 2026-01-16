import { ServiceService } from './service.service';
export declare class ServiceController {
    private serviceService;
    constructor(serviceService: ServiceService);
    findAll(): Promise<{
        id: string;
        name: string;
        description: string | null;
        price: number;
        duration: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        price: number;
        duration: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
