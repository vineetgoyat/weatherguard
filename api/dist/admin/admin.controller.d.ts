import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getAllUsers(): import("mongoose").Query<(import("mongoose").FlattenMaps<import("../users/schemas/user.schema").User> & {
        _id: import("mongoose").Types.ObjectId;
    })[], import("mongoose").Document<unknown, {}, import("../users/schemas/user.schema").User> & import("../users/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    }, {}, import("../users/schemas/user.schema").User, "find">;
    getPendingUsers(): import("mongoose").Query<(import("mongoose").FlattenMaps<import("../users/schemas/user.schema").User> & {
        _id: import("mongoose").Types.ObjectId;
    })[], import("mongoose").Document<unknown, {}, import("../users/schemas/user.schema").User> & import("../users/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    }, {}, import("../users/schemas/user.schema").User, "find">;
    approveUser(id: string): Promise<import("mongoose").Document<unknown, {}, import("../users/schemas/user.schema").User> & import("../users/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    rejectUser(id: string): Promise<import("mongoose").Document<unknown, {}, import("../users/schemas/user.schema").User> & import("../users/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    sendAlert(id: string): Promise<{
        success: boolean;
    }>;
    deleteUser(id: string): Promise<void>;
}
