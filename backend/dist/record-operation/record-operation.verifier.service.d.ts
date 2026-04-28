import { PrismaService } from '../prisma/prisma.service';
export declare class RecordOperationVerifierService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private baseUrl;
    private apiKey;
    private isTxConfirmed;
    private tryAdvisoryLock;
    private advisoryUnlock;
    tick(): Promise<void>;
}
