import { Request, Response } from "express";
import { AuditAction } from "@prisma/client";

import {
    logAction,
    getLogs,
} from "../services/auditLogService";

export const create = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            action,
            entityType,
            entityId,
            performedById,
            beforeData,
            afterData,
            description,
        } = req.body;

        if (
            !Object.values(AuditAction).includes(
                action
            )
        ) {
            return res.status(400).json({
                message: "Invalid audit action",
            });
        }

        if (
            !entityType ||
            typeof entityType !== "string"
        ) {
            return res.status(400).json({
                message: "Entity type is required",
            });
        }

        const parsedEntityId =
            Number(entityId);

        if (
            !Number.isInteger(parsedEntityId) ||
            parsedEntityId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid entity ID",
            });
        }

        const log = await logAction({
            action,
            entityType,
            entityId: parsedEntityId,
            performedById:
                performedById !== undefined
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
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to create audit log";

        return res.status(400).json({
            message,
        });
    }
};

export const getAll = async (
    req: Request,
    res: Response
) => {
    try {
        const entityType =
            typeof req.query.entityType === "string"
                ? req.query.entityType
                : undefined;

        const entityId =
            req.query.entityId !== undefined
                ? Number(req.query.entityId)
                : undefined;

        const logs = await getLogs(
            entityType,
            entityId
        );

        return res.status(200).json({
            logs,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch audit logs";

        return res.status(400).json({
            message,
        });
    }
};