import { PrismaService } from '../prisma/prisma.service';
export declare class RecordOperationVerifierService {
    private readonly prisma;
    private readonly logger;
    private blockfrost;
    constructor(prisma: PrismaService);
    private getBlockfrost;
    private isTxConfirmed;
    private tryAdvisoryLock;
    private advisoryUnlock;
    private markUnconfirmed;
    private markConfirmed;
    verifyPendingNow(): Promise<void>;
    tick(): Promise<void>;
    private tickInternal;
}
