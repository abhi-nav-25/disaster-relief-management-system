"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInventory = exports.findCampInventory = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const findCampInventory = async (campId) => {
    return prisma_1.default.campInventory.findMany({
        where: {
            campId,
        },
        include: {
            resource: true,
        },
        orderBy: {
            resource: {
                name: "asc",
            },
        },
    });
};
exports.findCampInventory = findCampInventory;
const updateInventory = async (campId, resourceId, movementQuantity, transactionType, notes) => {
    return prisma_1.default.$transaction(async (tx) => {
        const inventory = await tx.campInventory.findUnique({
            where: {
                campId_resourceId: {
                    campId,
                    resourceId,
                },
            },
        });
        const currentQuantity = inventory
            ? Number(inventory.quantity)
            : 0;
        let change = movementQuantity;
        if (transactionType === "DELIVERY" ||
            transactionType === "CONSUMPTION") {
            change = -Math.abs(movementQuantity);
        }
        if (transactionType === "RECEIPT") {
            change = Math.abs(movementQuantity);
        }
        const newQuantity = currentQuantity + change;
        if (newQuantity < 0) {
            throw new Error("Insufficient inventory for this transaction");
        }
        const updatedInventory = await tx.campInventory.upsert({
            where: {
                campId_resourceId: {
                    campId,
                    resourceId,
                },
            },
            update: {
                quantity: newQuantity,
            },
            create: {
                campId,
                resourceId,
                quantity: newQuantity,
            },
        });
        await tx.inventoryTransaction.create({
            data: {
                campId,
                resourceId,
                type: transactionType,
                quantity: Math.abs(change),
                notes,
            },
        });
        return updatedInventory;
    });
};
exports.updateInventory = updateInventory;
