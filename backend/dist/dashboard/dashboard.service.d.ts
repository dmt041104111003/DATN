import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private countPendingVerification;
    private loadVerifiedContainerKeys;
    private buildWarehouseStats;
    private buildEnterpriseStats;
    private buildLogisticsStats;
    getStats(custodianRaw: unknown, roleRaw: unknown): Promise<{
        role: string;
        production: {
            total: any;
            created: number;
            updated: number;
            closed: number;
            actualYieldKg: number;
        };
        container: {
            total: any;
            verified: number;
            unverified: number;
            inStorage: number;
            outStorage: number;
            consumed: number;
            totalWeightKg: number;
            inStorageWeightKg: number;
        };
        warehouse: {
            warehouseCount: any;
            inStorageCount: number;
            totalCapacityKg: number;
            usedKg: number;
            remainingKg: number;
            utilizationPercent: number;
            insToday: number;
            insLast7Days: number;
            consumedToday: number;
            consumedLast7Days: number;
            consumedTotal: number;
        };
        warehouseUtilization: any;
        activityByDay: {
            date: string;
            warehouseIn: number;
            consume: number;
        }[];
        pendingVerification: any;
    } | {
        role: "AGENT" | "TRANSIT";
        warehouse: {
            warehouseCount: any;
            inStorageCount: number;
            totalCapacityKg: number;
            usedKg: number;
            remainingKg: number;
            utilizationPercent: number;
            insToday: number;
            insLast7Days: number;
            consumedToday: number;
            consumedLast7Days: number;
            consumedTotal: number;
        };
        warehouseUtilization: any;
        activityByDay: {
            date: string;
            warehouseIn: number;
            consume: number;
        }[];
        pendingVerification: any;
    }>;
}
