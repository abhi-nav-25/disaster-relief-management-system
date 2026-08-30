import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import {
    RequestChannel,
    Priority,
} from "@prisma/client";

import {
    createCampResourceRequest,
    getRequest,
    getCampRequests,
    getAllRequests,
    verifyRequest,
    setRequestPriority,
} from "../services/resourceRequestService";

export const createRequest = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const {
            channel,
            description,
            items,
        } = req.body;

        // Camp Manager requests created through the API
        // must be ONLINE.
        if (channel !== RequestChannel.ONLINE) {
            return res.status(400).json({
                message:
                    "Camp Manager requests must use the ONLINE channel",
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message:
                    "At least one resource item is required",
            });
        }

        const request =
            await createCampResourceRequest(
                userId,
                {
                    channel,
                    description,
                    items,
                }
            );

        return res.status(201).json({
            message:
                "Resource request created successfully",
            request,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to create resource request";

        return res.status(400).json({
            message,
        });
    }
};

export const getOneRequest = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        const request = await getRequest(id);

        return res.status(200).json({
            request,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Resource request not found";

        return res.status(404).json({
            message,
        });
    }
};

export const getMyCampRequests = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const requests =
            await getCampRequests(userId);

        return res.status(200).json({
            requests,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch requests";

        return res.status(400).json({
            message,
        });
    }
};

export const getRequests = async (
    req: Request,
    res: Response
) => {
    try {
        const requests = await getAllRequests();

        return res.status(200).json({
            requests,
        });
    } catch {
        return res.status(500).json({
            message: "Failed to fetch resource requests",
        });
    }
};

export const verify = async (
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

        const requestId = Number(req.params.id);

        const { verificationStatus } =
            req.body;

        if (
            verificationStatus !== "VERIFIED" &&
            verificationStatus !== "REJECTED"
        ) {
            return res.status(400).json({
                message:
                    "Verification status must be VERIFIED or REJECTED",
            });
        }

        const request = await verifyRequest(
            requestId,
            operatorId,
            verificationStatus
        );

        return res.status(200).json({
            message:
                "Resource request verification updated successfully",
            request,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to verify request";

        return res.status(400).json({
            message,
        });
    }
};

export const updatePriority = async (
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

        const requestId = Number(req.params.id);

        const { priority } = req.body;

        if (
            !Object.values(Priority).includes(priority)
        ) {
            return res.status(400).json({
                message: "Invalid priority",
            });
        }

        const request =
            await setRequestPriority(
                requestId,
                priority,
                operatorId
            );

        return res.status(200).json({
            message:
                "Request priority updated successfully",
            request,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update request priority";

        return res.status(400).json({
            message,
        });
    }
};