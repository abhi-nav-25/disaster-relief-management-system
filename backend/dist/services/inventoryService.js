"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOwnCampInventory = exports.getOwnCampInventory = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const inventoryRepository_1 = require("../repositories/inventoryRepository");
const getOwnCampInventory = async (userId) => {
    const user = await prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            role: true,
            managedCampId: true,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role !== "RELIEF_CAMP_MANAGER") {
        throw new Error("Only a Relief Camp Manager can access camp inventory");
    }
    if (!user.managedCampId) {
        throw new Error("Relief Camp Manager is not assigned to a camp");
    }
    return (0, inventoryRepository_1.findCampInventory)(user.managedCampId);
};
exports.getOwnCampInventory = getOwnCampInventory;
const updateOwnCampInventory = async (userId, resourceId, quantity, transactionType, notes) => {
    const user = await prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            role: true,
            managedCampId: true,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role !== "RELIEF_CAMP_MANAGER") {
        throw new Error("Only a Relief Camp Manager can update camp inventory");
    }
    if (!user.managedCampId) {
        throw new Error("Relief Camp Manager is not assigned to a camp");
    }
    if (!Number.isInteger(resourceId) || resourceId <= 0) {
        throw new Error("Invalid resource ID");
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error("Transaction quantity must be greater than zero");
    }
    const resource = await prisma_1.default.resource.findUnique({
        where: {
            id: resourceId,
        },
        select: {
            isActive: true,
        },
    });
    if (!resource) {
        throw new Error("Resource not found");
    }
    if (!resource.isActive) {
        throw new Error("Resource is inactive");
    }
    return (0, inventoryRepository_1.updateInventory)(user.managedCampId, resourceId, quantity, transactionType, notes);
};
exports.updateOwnCampInventory = updateOwnCampInventory;
