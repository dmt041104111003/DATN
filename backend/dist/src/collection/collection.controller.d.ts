import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
export declare class CollectionController {
    private collectionService;
    constructor(collectionService: CollectionService);
    findAll(): Promise<{
        name: string;
        thumbnail: string | null;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }[]>;
    findMy(user: {
        id: string;
    }): Promise<{
        name: string;
        thumbnail: string | null;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        thumbnail: string | null;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    create(user: {
        id: string;
    }, dto: CreateCollectionDto): Promise<{
        name: string;
        thumbnail: string | null;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateCollectionDto): Promise<{
        name: string;
        thumbnail: string | null;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
        name: string;
        thumbnail: string | null;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
}
