import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getAllUsers(): Promise<(import("mongoose").Document<unknown, {}, import("../users/schemas/user.schema").User> & import("../users/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getPendingUsers(): Promise<(import("mongoose").Document<unknown, {}, import("../users/schemas/user.schema").User> & import("../users/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    approveUser(id: string): Promise<import("mongoose").Document<unknown, {}, import("../users/schemas/user.schema").User> & import("../users/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    rejectUser(id: string): Promise<import("mongoose").Document<unknown, {}, import("../users/schemas/user.schema").User> & import("../users/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    sendAlert(id: string): Promise<{
        success: boolean;
    }>;
}
