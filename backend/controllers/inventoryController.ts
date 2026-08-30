import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { InventoryTransactionType } from "@prisma/client";

import {
    getOwnCampInventory,
    updateOwnCampInventory,
} from "../services/inventoryService";

export const getInventory = async (
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

        const inventory = await getOwnCampInventory(userId);

        return res.status(200).json({
            inventory,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch inventory";

        return res.status(400).json({
            message,
        });
    }
};

export const updateInventory = async (
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

        const resourceId = Number(req.params.resourceId);

        const {
            quantity,
            transactionType,
            notes,
        } = req.body;

        if (!Number.isFinite(resourceId) || resourceId <= 0) {
            return res.status(400).json({
                message: "Invalid resource ID",
            });
        }

        if (!Number.isFinite(quantity) || quantity < 0) {
            return res.status(400).json({
                message: "Invalid quantity",
            });
        }

        if (
            !Object.values(InventoryTransactionType).includes(
                transactionType
            )
        ) {
            return res.status(400).json({
                message: "Invalid transaction type",
            });
        }

        const inventory =
            await updateOwnCampInventory(
                userId,
                resourceId,
                quantity,
                transactionType,
                notes
            );

        return res.status(200).json({
            message: "Inventory updated successfully",
            inventory,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update inventory";

        return res.status(400).json({
            message,
        });
    }
};