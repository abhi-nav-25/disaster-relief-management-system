import prisma from "../config/prisma";
import {
    findCampInventory,
    updateInventory,
} from "../repositories/inventoryRepository";
import { InventoryTransactionType } from "@prisma/client";

export const getOwnCampInventory = async (
    userId: number
) => {
    const user = await prisma.user.findUnique({
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
        throw new Error(
            "Only a Relief Camp Manager can access camp inventory"
        );
    }

    if (!user.managedCampId) {
        throw new Error(
            "Relief Camp Manager is not assigned to a camp"
        );
    }

    return findCampInventory(user.managedCampId);
};

export const updateOwnCampInventory = async (
    userId: number,
    resourceId: number,
    quantity: number,
    transactionType: InventoryTransactionType,
    notes?: string
) => {
    const user = await prisma.user.findUnique({
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
        throw new Error(
            "Only a Relief Camp Manager can update camp inventory"
        );
    }

    if (!user.managedCampId) {
        throw new Error(
            "Relief Camp Manager is not assigned to a camp"
        );
    }

    if (!Number.isInteger(resourceId) || resourceId <= 0) {
        throw new Error("Invalid resource ID");
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error(
            "Transaction quantity must be greater than zero"
        );
    }

    return updateInventory(
        user.managedCampId,
        resourceId,
        quantity,
        transactionType,
        notes
    );
};