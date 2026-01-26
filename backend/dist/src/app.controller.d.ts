import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getUsers(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        walletName: string | null;
        displayName: string | null;
        location: string | null;
        gpsLatitude: number | null;
        gpsLongitude: number | null;
    }[]>;
    health(): {
        status: string;
        timestamp: string;
    };
}
