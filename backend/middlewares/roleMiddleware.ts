import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authMiddleware";

type UserRole =
    | "CITIZEN"
    | "RELIEF_CAMP_MANAGER"
    | "CONTROL_CENTRE_OPERATOR"
    | "DMA_SUPERVISOR"
    | "RELIEF_TEAM";

export const authorize = (...allowedRoles: UserRole[]) => {
    return (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        if (!allowedRoles.includes(req.user.role as UserRole)) {
            return res.status(403).json({
                message: "You do not have permission to perform this action",
            });
        }

        next();
    };
};