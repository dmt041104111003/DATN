import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SupplierController {
    private supplierService;
    constructor(supplierService: SupplierService);
    findAll(user: {
        id: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
    }[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
    }>;
    create(user: {
        id: string;
    }, dto: CreateSupplierDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateSupplierDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
    }>;
}
