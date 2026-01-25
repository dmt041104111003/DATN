import { PrismaService } from '../prisma.service';
export declare class SubscriptionSchedulerService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    checkExpiringSubscriptions(): Promise<void>;
    private sendNotification;
}
