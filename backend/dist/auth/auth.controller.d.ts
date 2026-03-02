import { AuthService } from "./auth.service";
import { NonceRequestDto } from "./dto/nonce.dto";
import { VerifySignatureDto } from "./dto/verify-signature.dto";
import { CreateProfileDto } from "./dto/create-profile.dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    createNonce(body: NonceRequestDto): {
        nonce: string;
    };
    verifySignature(body: VerifySignatureDto): Promise<{
        token: string;
        profile: {
            id: number;
            role: string;
            displayName: string;
            avatarUrl: string | null;
            location: string | null;
            coordinates: string | null;
        };
    } | {
        needProfile: true;
        roles: {
            id: number;
            code: string;
        }[];
    }>;
    createProfile(body: CreateProfileDto): Promise<{
        token: string;
        profile: {
            id: number;
            role: string;
            displayName: string;
            avatarUrl: string | null;
            location: string | null;
            coordinates: string | null;
        };
    }>;
}
