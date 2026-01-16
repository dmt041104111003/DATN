import { PrismaService } from '../prisma.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { UpdateMediaDto } from './dto/update-media.dto';
export declare class MediaService {
    private prisma;
    private ipfs;
    constructor(prisma: PrismaService, ipfs: IpfsService);
    findAllByUser(userId: string): Promise<{
        gatewayUrl: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        url: string;
        type: string;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        gatewayUrl: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        url: string;
        type: string;
    }>;
    uploadToIpfs(userId: string, file: Express.Multer.File): Promise<{
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
    uploadBatchToIpfs(userId: string, files: Express.Multer.File[]): Promise<{
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
    update(id: string, userId: string, dto: UpdateMediaDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        url: string;
        type: string;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        url: string;
        type: string;
    }>;
    private getFileType;
}
