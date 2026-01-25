import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SupplierController {
    private supplierService;
    constructor(supplierService: SupplierService);
    findAll(user: {
        id: string;
    }): Promise<string | {
        id: string;
        userId: string;
        name: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<{
        id: string;
        userId: string;
        name: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(user: {
        id: string;
    }, dto: CreateSupplierDto): Promise<{
        id: string;
        userId: string;
        name: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateSupplierDto): Promise<{
        id: string;
        userId: string;
        name: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<void>;
}
