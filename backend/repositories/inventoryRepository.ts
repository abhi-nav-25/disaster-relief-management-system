import prisma from "../config/prisma";
import { InventoryTransactionType } from "@prisma/client";

export const findCampInventory = async (campId: number) => {
    return prisma.campInventory.findMany({
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

export const updateInventory = async (
    campId: number,
    resourceId: number,
    movementQuantity: number,
    transactionType: InventoryTransactionType,
    notes?: string
) => {
    return prisma.$transaction(async (tx) => {
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

        if (
            transactionType === "DELIVERY" ||
            transactionType === "CONSUMPTION"
        ) {
            change = -Math.abs(movementQuantity);
        }

        if (transactionType === "RECEIPT") {
            change = Math.abs(movementQuantity);
        }

        const newQuantity = currentQuantity + change;

        if (newQuantity < 0) {
            throw new Error(
                "Insufficient inventory for this transaction"
            );
        }

        const updatedInventory =
            await tx.campInventory.upsert({
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