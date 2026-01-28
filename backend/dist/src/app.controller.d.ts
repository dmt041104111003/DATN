import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getUsers(): Promise<string | {
        id: string;
        address: string;
        walletName: string | null;
        displayName: string | null;
        location: string | null;
        gpsLatitude: number | null;
        gpsLongitude: number | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    health(): {
        status: string;
        timestamp: string;
    };
}
