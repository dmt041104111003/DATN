import { MediaService } from './media.service';
import { UpdateMediaDto } from './dto/update-media.dto';
export declare class MediaController {
    private mediaService;
    constructor(mediaService: MediaService);
    findAll(user: {
        id: string;
    }): Promise<{
        gatewayUrl: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        url: string;
        type: string;
    }[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<{
        gatewayUrl: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        url: string;
        type: string;
    }>;
    uploadFile(user: {
        id: string;
    }, file: Express.Multer.File): Promise<{
        cid: string;
        gatewayUrl: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        url: string;
        type: string;
    }>;
    uploadFiles(user: {
        id: string;
    }, files: Express.Multer.File[]): Promise<{
        cid: string;
        gatewayUrl: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        url: string;
        type: string;
    }[]>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateMediaDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        url: string;
        type: string;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        url: string;
        type: string;
    }>;
}
