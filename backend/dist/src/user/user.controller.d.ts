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
        address: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateMe(user: {
        id: string;
        address: string;
    }, dto: UpdateUserDto): Promise<{
        id: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteMe(user: {
        id: string;
        address: string;
    }): Promise<{
        id: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
