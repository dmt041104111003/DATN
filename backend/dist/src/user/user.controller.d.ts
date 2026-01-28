import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpsertAgentDto } from './dto/upsert-agent.dto';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getMe(user: {
        id: string;
        address: string;
    }): Promise<string | {
        id: string;
        address: string;
        walletName: string | null;
        displayName: string | null;
        location: string | null;
        gpsLatitude: number | null;
        gpsLongitude: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listAgents(user: {
        id: string;
        address: string;
    }): Promise<any>;
    upsertAgent(user: {
        id: string;
        address: string;
    }, dto: UpsertAgentDto): Promise<any>;
    updateMe(user: {
        id: string;
        address: string;
    }, dto: UpdateUserDto): Promise<{
        id: string;
        address: string;
        walletName: string | null;
        displayName: string | null;
        location: string | null;
        gpsLatitude: number | null;
        gpsLongitude: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteMe(user: {
        id: string;
        address: string;
    }): Promise<{
        id: string;
        address: string;
        walletName: string | null;
        displayName: string | null;
        location: string | null;
        gpsLatitude: number | null;
        gpsLongitude: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
