import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
export declare class MediaController {
    private mediaService;
    constructor(mediaService: MediaService);
    findAll(user: {
        id: string;
    }): Promise<{
        name: string;
        type: string;
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<{
        name: string;
        type: string;
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    create(user: {
        id: string;
    }, dto: CreateMediaDto): Promise<{
        name: string;
        type: string;
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateMediaDto): Promise<{
        name: string;
        type: string;
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
        name: string;
        type: string;
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
}
