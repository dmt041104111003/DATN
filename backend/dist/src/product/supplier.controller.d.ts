import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SupplierController {
    private supplierService;
    constructor(supplierService: SupplierService);
    findAll(): Promise<{
        id: string;
        name: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    create(dto: CreateSupplierDto): Promise<{
        id: string;
        name: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    update(id: string, dto: UpdateSupplierDto): Promise<{
        id: string;
        name: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
}
