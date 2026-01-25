import { MetadataService } from './metadata.service';
import { CreateMetadataDto } from './dto/create-metadata.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';
export declare class MetadataController {
    private metadataService;
    constructor(metadataService: MetadataService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        collectionId: string;
        assetName: string | null;
        content: string;
        nftReference: string[];
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        collectionId: string;
        assetName: string | null;
        content: string;
        nftReference: string[];
    }>;
    create(user: {
        id: string;
    }, dto: CreateMetadataDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        collectionId: string;
        assetName: string | null;
        content: string;
        nftReference: string[];
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateMetadataDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        collectionId: string;
        assetName: string | null;
        content: string;
        nftReference: string[];
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        collectionId: string;
        assetName: string | null;
        content: string;
        nftReference: string[];
    }>;
}
