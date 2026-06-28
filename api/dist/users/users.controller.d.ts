import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(req: any): Promise<import("./schemas/user.schema").UserDocument>;
    updateCity(req: any, city: string): Promise<import("./schemas/user.schema").UserDocument>;
    updateRequestMessage(req: any, message: string): Promise<import("./schemas/user.schema").UserDocument>;
    getUser(id: string): Promise<import("./schemas/user.schema").UserDocument>;
}
