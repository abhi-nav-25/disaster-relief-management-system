import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { DeliveryStatus } from "@prisma/client";

import {
    createResourceDelivery,
    getDelivery,
    getRequestDeliveries,
    changeDeliveryStatus,
} from "../services/deliveryService";

export const create = async (
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

        const {
            requestId,
            teamId,
            notes,
            items,
        } = req.body;

        if (
            !Number.isInteger(Number(requestId)) ||
            Number(requestId) <= 0
        ) {
            return res.status(400).json({
                message: "Invalid request ID",
            });
        }

        if (
            !Number.isInteger(Number(teamId)) ||
            Number(teamId) <= 0
        ) {
            return res.status(400).json({
                message: "Invalid team ID",
            });
        }

        const delivery =
            await createResourceDelivery(
                operatorId,
                {
                    requestId: Number(requestId),
                    teamId: Number(teamId),
                    notes,
                    items,
                }
            );

        return res.status(201).json({
            message:
                "Resource delivery created successfully",
            delivery,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to create resource delivery";

        return res.status(400).json({
            message,
        });
    }
};

export const getOne = async (
    req: Request,
    res: Response
) => {
    try {
        const deliveryId =
            Number(req.params.id);

        const delivery =
            await getDelivery(deliveryId);

        return res.status(200).json({
            delivery,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Delivery not found";

        return res.status(404).json({
            message,
        });
    }
};

export const getForRequest = async (
    req: Request,
    res: Response
) => {
    try {
        const requestId =
            Number(req.params.requestId);

        const deliveries =
            await getRequestDeliveries(
                requestId
            );

        return res.status(200).json({
            deliveries,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch deliveries";

        return res.status(400).json({
            message,
        });
    }
};

export const updateStatus = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const deliveryId =
            Number(req.params.id);

        const { status } = req.body;

        if (
            !Object.values(DeliveryStatus).includes(
                status
            )
        ) {
            return res.status(400).json({
                message: "Invalid delivery status",
            });
        }

        const delivery =
            await changeDeliveryStatus(
                deliveryId,
                status
            );

        return res.status(200).json({
            message:
                "Delivery status updated successfully",
            delivery,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update delivery status";

        return res.status(400).json({
            message,
        });
    }
};
