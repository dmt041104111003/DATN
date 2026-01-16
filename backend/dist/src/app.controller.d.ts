import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getUsers(): Promise<{
        id: string;
        address: string;
        createdAt: Date;
    }[]>;
}
