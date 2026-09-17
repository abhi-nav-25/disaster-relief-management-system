"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = exports.create = void 0;
const client_1 = require("@prisma/client");
const auditLogService_1 = require("../services/auditLogService");
const create = async (req, res) => {
    try {
        const { action, entityType, entityId, performedById, beforeData, afterData, description, } = req.body;
        if (!Object.values(client_1.AuditAction).includes(action)) {
            return res.status(400).json({
                message: "Invalid audit action",
            });
        }
        if (!entityType ||
            typeof entityType !== "string") {
            return res.status(400).json({
                message: "Entity type is required",
            });
        }
        const parsedEntityId = Number(entityId);
        if (!Number.isInteger(parsedEntityId) ||
            parsedEntityId <= 0) {
            return res.status(400).json({
                message: "Invalid entity ID",
            });
        }
        const log = await (0, auditLogService_1.logAction)({
            action,
            entityType,
            entityId: parsedEntityId,
            performedById: performedById !== undefined
                ? Number(performedById)
                : undefined,
            beforeData,
            afterData,
            description,
        });
        return res.status(201).json({
            message: "Audit log created successfully",
            log,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to create audit log";
        return res.status(400).json({
            message,
        });
    }
};
exports.create = create;
const getAll = async (req, res) => {
    try {
        const entityType = typeof req.query.entityType === "string"
            ? req.query.entityType
            : undefined;
        const entityId = req.query.entityId !== undefined
            ? Number(req.query.entityId)
            : undefined;
        const logs = await (0, auditLogService_1.getLogs)(entityType, entityId);
        return res.status(200).json({
            logs,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to fetch audit logs";
        return res.status(400).json({
            message,
        });
    }
};
exports.getAll = getAll;
