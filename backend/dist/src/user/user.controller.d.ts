import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getMe(user: {
        id: string;
        address: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        walletName: string | null;
        displayName: string | null;
        location: string | null;
        gpsLatitude: number | null;
        gpsLongitude: number | null;
    }>;
    updateMe(user: {
        id: string;
        address: string;
    }, dto: UpdateUserDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        walletName: string | null;
        displayName: string | null;
        location: string | null;
        gpsLatitude: number | null;
        gpsLongitude: number | null;
    }>;
    deleteMe(user: {
        id: string;
        address: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        walletName: string | null;
        displayName: string | null;
        location: string | null;
        gpsLatitude: number | null;
        gpsLongitude: number | null;
    }>;
}
