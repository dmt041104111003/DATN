import { AuthService } from "./auth.service";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    createNonce(stakeAddress?: string): {
        nonce: string;
    };
    verifySignature(body: {
        stakeAddress?: string;
        nonce?: string;
        signature?: string;
        key?: string;
    }): {
        token: string;
    };
}
