import { RedisService } from '../redis.service';
interface SessionData {
    userId: string;
    address: string;
    walletName?: string;
    loginAt: string;
    lastActivity: string;
}
export declare class SessionExampleService {
    private redis;
    constructor(redis: RedisService);
    createSession(userId: string, address: string, walletName?: string): Promise<string>;
    getSession(userId: string): Promise<SessionData | null>;
    updateLastActivity(userId: string): Promise<void>;
    deleteSession(userId: string): Promise<void>;
    isValidSession(userId: string): Promise<boolean>;
    getAllUserSessions(userId: string): Promise<SessionData[]>;
    deleteAllUserSessions(userId: string): Promise<void>;
}
export {};
