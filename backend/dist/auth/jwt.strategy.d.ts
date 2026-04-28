import { Strategy } from 'passport-jwt';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: any): Promise<{
        sub: any;
        stakeAddress: any;
        paymentAddress: any;
        walletAddress: any;
        profileId: any;
        role: any;
        displayName: any;
    }>;
}
export {};
