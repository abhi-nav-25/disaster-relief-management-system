import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { DuplicateDecision } from "@prisma/client";

import {
    detectPossibleDuplicates,
    getDuplicateChecks,
    decideDuplicate,
} from "../services/duplicateCheckService";

export const detectDuplicates = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const requestId = Number(req.params.id);

        if (!Number.isInteger(requestId) || requestId <= 0) {
            return res.status(400).json({
                message: "Invalid request ID",
            });
        }

        const checks =
            await detectPossibleDuplicates(requestId);

        return res.status(200).json({
            message:
                "Duplicate detection completed",
            possibleDuplicates: checks,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to detect duplicates";

        return res.status(400).json({
            message,
        });
    }
};

export const getChecks = async (
    req: Request,
    res: Response
) => {
    try {
        const requestId = Number(req.params.id);

        if (!Number.isInteger(requestId) || requestId <= 0) {
            return res.status(400).json({
                message: "Invalid request ID",
            });
        }

        const checks =
            await getDuplicateChecks(requestId);

        return res.status(200).json({
            checks,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch duplicate checks";

        return res.status(400).json({
            message,
        });
    }
};

export const reviewDuplicate = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const operatorId = req.user?.userId;

        if (!operatorId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const checkId = Number(req.params.id);

        if (!Number.isInteger(checkId) || checkId <= 0) {
            return res.status(400).json({
                message: "Invalid duplicate check ID",
            });
        }

        const { decision } = req.body;

        if (
            !Object.values(DuplicateDecision).includes(
                decision
            )
        ) {
            return res.status(400).json({
                message: "Invalid duplicate decision",
            });
        }

        const check = await decideDuplicate(
            checkId,
            operatorId,
            decision
        );

        return res.status(200).json({
            message:
                "Duplicate decision recorded successfully",
            check,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to review duplicate";

        return res.status(400).json({
            message,
        });
    }
};