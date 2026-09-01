import prisma from "../config/prisma";
import { AuditAction, Prisma } from "@prisma/client";

export const createAuditLog = async (data: {
    action: AuditAction;
    entityType: string;
    entityId: number;
    performedById?: number;
    beforeData?: Prisma.InputJsonValue;
    afterData?: Prisma.InputJsonValue;
    description?: string;
}) => {
    return prisma.auditLog.create({
        data: {
            action: data.action,
            entityType: data.entityType,
            entityId: data.entityId,
            performedById: data.performedById,
            beforeData: data.beforeData,
            afterData: data.afterData,
            description: data.description,
        },
    });
};

export const findAuditLogs = async (
    entityType?: string,
    entityId?: number
) => {
    return prisma.auditLog.findMany({
        where: {
            entityType,
            entityId,
        },
        include: {
            performedBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};