import { PrismaService } from '../prisma/prisma.service';
import { RecordOperationVerifierService } from './record-operation.verifier.service';
export declare class RecordOperationController {
    private readonly prisma;
    private readonly verifier;
    constructor(prisma: PrismaService, verifier: RecordOperationVerifierService);
    private getCustodian;
    verifyPending(): Promise<{
        ok: boolean;
    }>;
    list(req: any, entityTypeParam: string, entityKeyParam: string): Promise<any[]>;
}
