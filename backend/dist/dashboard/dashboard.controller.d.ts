import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    private getCustodian;
    private getRole;
    stats(req: any): Promise<{
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
