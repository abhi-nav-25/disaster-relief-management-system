"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInventory = exports.getInventory = void 0;
const client_1 = require("@prisma/client");
const inventoryService_1 = require("../services/inventoryService");
const getInventory = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const inventory = await (0, inventoryService_1.getOwnCampInventory)(userId);
        return res.status(200).json({
            inventory,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to fetch inventory";
        return res.status(400).json({
            message,
        });
    }
};
exports.getInventory = getInventory;
const updateInventory = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const resourceId = Number(req.params.resourceId);
        const { quantity, transactionType, notes, } = req.body;
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
        if (!Object.values(client_1.InventoryTransactionType).includes(transactionType)) {
            return res.status(400).json({
                message: "Invalid transaction type",
            });
        }
        const inventory = await (0, inventoryService_1.updateOwnCampInventory)(userId, resourceId, quantity, transactionType, notes);
        return res.status(200).json({
            message: "Inventory updated successfully",
            inventory,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to update inventory";
        return res.status(400).json({
            message,
        });
    }
};
exports.updateInventory = updateInventory;
