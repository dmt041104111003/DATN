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
        userId: string;
        name: string;
        type: string;
        url: string;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        gatewayUrl: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        name: string;
        type: string;
        url: string;
    }>;
    uploadToIpfs(userId: string, file: Express.Multer.File): Promise<{
        cid: string;
        gatewayUrl: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        name: string;
        type: string;
        url: string;
    }>;
    uploadBatchToIpfs(userId: string, files: Express.Multer.File[]): Promise<{
        cid: string;
        gatewayUrl: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        name: string;
        type: string;
        url: string;
    }[]>;
    update(id: string, userId: string, dto: UpdateMediaDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        name: string;
        type: string;
        url: string;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        name: string;
        type: string;
        url: string;
    }>;
    private getFileType;
}
