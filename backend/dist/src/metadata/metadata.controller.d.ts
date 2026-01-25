import { MetadataService } from './metadata.service';
import { CreateMetadataDto } from './dto/create-metadata.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';
export declare class MetadataController {
    private metadataService;
    constructor(metadataService: MetadataService);
    findAll(): Promise<string | {
        id: string;
        assetName: string | null;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        collectionId: string;
        nftReference: string[];
    }[]>;
    findOne(id: string): Promise<string | {
        id: string;
        assetName: string | null;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        collectionId: string;
        nftReference: string[];
    }>;
    create(user: {
        id: string;
    }, dto: CreateMetadataDto): Promise<{
        id: string;
        assetName: string | null;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        collectionId: string;
        nftReference: string[];
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateMetadataDto): Promise<{
        id: string;
        assetName: string | null;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        collectionId: string;
        nftReference: string[];
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<void>;
}
