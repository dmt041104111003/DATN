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
    }[]>;
    health(): {
        status: string;
        timestamp: string;
    };
}
