import { MediaService } from './media.service';
import { UpdateMediaDto } from './dto/update-media.dto';
export declare class MediaController {
    private mediaService;
    constructor(mediaService: MediaService);
    findAll(user: {
        id: string;
    }): Promise<string | {
        gatewayUrl: string;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        url: string;
        mediaHash: string;
    }[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<{
        id: string;
        userId: string;
        name: string;
        type: string;
        url: string;
        gatewayUrl: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    uploadFile(user: {
        id: string;
    }, file: Express.Multer.File): Promise<any>;
    uploadFiles(user: {
        id: string;
    }, files: Express.Multer.File[]): Promise<{
        successful: any[];
        failed: number;
        total: number;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateMediaDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        url: string;
        mediaHash: string;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<void>;
}
