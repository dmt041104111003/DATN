import { MediaService } from './media.service';
import { UpdateMediaDto } from './dto/update-media.dto';
export declare class MediaController {
    private mediaService;
    constructor(mediaService: MediaService);
    findAll(user: {
        id: string;
    }): Promise<{
        gatewayUrl: string;
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        type: string;
    }[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<{
        gatewayUrl: string;
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        type: string;
    }>;
    uploadFile(user: {
        id: string;
    }, file: Express.Multer.File): Promise<{
        cid: string;
        gatewayUrl: string;
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        type: string;
    }>;
    uploadFiles(user: {
        id: string;
    }, files: Express.Multer.File[]): Promise<{
        cid: string;
        gatewayUrl: string;
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        type: string;
    }[]>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateMediaDto): Promise<{
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        type: string;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        type: string;
    }>;
}
