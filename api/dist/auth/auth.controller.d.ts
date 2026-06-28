import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    googleAuth(): void;
    googleCallback(req: any, res: any): Promise<void>;
    githubAuth(): void;
    githubCallback(req: any, res: any): Promise<void>;
}
