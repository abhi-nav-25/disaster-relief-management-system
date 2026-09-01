import { AuditAction, Prisma } from "@prisma/client";
import {
    createAuditLog,
    findAuditLogs,
} from "../repositories/auditLogRepository";

export const logAction = async (data: {
    action: AuditAction;
    entityType: string;
    entityId: number;
    performedById?: number;
    beforeData?: Prisma.InputJsonValue;
    afterData?: Prisma.InputJsonValue;
    description?: string;
}) => {
    return createAuditLog(data);
};

export const getLogs = async (
    entityType?: string,
    entityId?: number
) => {
    if (
        entityId !== undefined &&
        (!Number.isInteger(entityId) || entityId <= 0)
    ) {
        throw new Error("Invalid entity ID");
    }

    return findAuditLogs(
        entityType,
        entityId
    );
};