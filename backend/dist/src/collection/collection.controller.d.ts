import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
export declare class CollectionController {
    private collectionService;
    constructor(collectionService: CollectionService);
    findAll(): Promise<string | {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        thumbnail: string | null;
        description: string | null;
    }[]>;
    findMy(user: {
        id: string;
    }): Promise<string | {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        thumbnail: string | null;
        description: string | null;
    }[]>;
    findOne(id: string): Promise<string | {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        thumbnail: string | null;
        description: string | null;
    }>;
    create(user: {
        id: string;
    }, dto: CreateCollectionDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        thumbnail: string | null;
        description: string | null;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateCollectionDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        thumbnail: string | null;
        description: string | null;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<void>;
}
