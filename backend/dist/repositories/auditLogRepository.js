"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAuditLogs = exports.createAuditLog = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createAuditLog = async (data) => {
    return prisma_1.default.auditLog.create({
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
exports.createAuditLog = createAuditLog;
const findAuditLogs = async (entityType, entityId) => {
    return prisma_1.default.auditLog.findMany({
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
exports.findAuditLogs = findAuditLogs;
