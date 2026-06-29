import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateOAuthUser(profile: {
        name: string;
        email: string;
        avatar: string;
        provider: string;
        providerId: string;
    }): Promise<import("../users/schemas/user.schema").UserDocument>;
    generateToken(user: any): Promise<{
        access_token: string;
        user: any;
    }>;
}
