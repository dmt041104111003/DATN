import { PrismaService } from '../prisma.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { UpdateMediaDto } from './dto/update-media.dto';
export declare class MediaService {
    private prisma;
    private ipfs;
    constructor(prisma: PrismaService, ipfs: IpfsService);
    findAllByUser(userId: string): Promise<{
        gatewayUrl: string;
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        type: string;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        gatewayUrl: string;
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        type: string;
    }>;
    uploadToIpfs(userId: string, file: Express.Multer.File): Promise<{
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
    uploadBatchToIpfs(userId: string, files: Express.Multer.File[]): Promise<{
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
    update(id: string, userId: string, dto: UpdateMediaDto): Promise<{
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        type: string;
    }>;
    remove(id: string, userId: string): Promise<{
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        type: string;
    }>;
    private getFileType;
}
