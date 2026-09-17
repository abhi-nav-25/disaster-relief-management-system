"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeliveryStatus = exports.findDeliveriesByRequest = exports.findDeliveryById = exports.createDelivery = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createDelivery = async (data) => {
    return prisma_1.default.resourceDelivery.create({
        data: {
            requestId: data.requestId,
            campId: data.campId,
            teamId: data.teamId,
            notes: data.notes,
            items: {
                create: data.items.map((item) => ({
                    resourceId: item.resourceId,
                    quantity: item.quantity,
                })),
            },
        },
        include: {
            items: {
                include: {
                    resource: true,
                },
            },
            request: true,
            camp: true,
            team: true,
        },
    });
};
exports.createDelivery = createDelivery;
const findDeliveryById = async (id) => {
    return prisma_1.default.resourceDelivery.findUnique({
        where: {
            id,
        },
        include: {
            items: {
                include: {
                    resource: true,
                },
            },
            request: {
                include: {
                    items: {
                        include: {
                            resource: true,
                        },
                    },
                },
            },
            camp: true,
            team: true,
        },
    });
};
exports.findDeliveryById = findDeliveryById;
const findDeliveriesByRequest = async (requestId) => {
    return prisma_1.default.resourceDelivery.findMany({
        where: {
            requestId,
        },
        include: {
            items: {
                include: {
                    resource: true,
                },
            },
            team: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.findDeliveriesByRequest = findDeliveriesByRequest;
const updateDeliveryStatus = async (id, status) => {
    return prisma_1.default.$transaction(async (tx) => {
        const delivery = await tx.resourceDelivery.findUnique({
            where: {
                id,
            },
            include: {
                items: true,
            },
        });
        if (!delivery) {
            throw new Error("Delivery not found");
        }
        const data = {
            status,
        };
        if (status === "IN_TRANSIT") {
            data.dispatchedAt = new Date();
        }
        if (status === "DELIVERED" ||
            status === "PARTIALLY_DELIVERED") {
            data.deliveredAt = new Date();
        }
        // Update inventory when resources are delivered.
        if (status === "DELIVERED" ||
            status === "PARTIALLY_DELIVERED") {
            for (const item of delivery.items) {
                const inventory = await tx.campInventory.findUnique({
                    where: {
                        campId_resourceId: {
                            campId: delivery.campId,
                            resourceId: item.resourceId,
                        },
                    },
                });
                if (inventory) {
                    await tx.campInventory.update({
                        where: {
                            campId_resourceId: {
                                campId: delivery.campId,
                                resourceId: item.resourceId,
                            },
                        },
                        data: {
                            quantity: {
                                increment: item.quantity,
                            },
                        },
                    });
                }
                else {
                    await tx.campInventory.create({
                        data: {
                            campId: delivery.campId,
                            resourceId: item.resourceId,
                            quantity: item.quantity,
                        },
                    });
                }
                await tx.inventoryTransaction.create({
                    data: {
                        campId: delivery.campId,
                        resourceId: item.resourceId,
                        type: "RECEIPT",
                        quantity: item.quantity,
                        referenceType: "RESOURCE_DELIVERY",
                        referenceId: delivery.id,
                    },
                });
            }
        }
        return tx.resourceDelivery.update({
            where: {
                id,
            },
            data,
            include: {
                items: {
                    include: {
                        resource: true,
                    },
                },
            },
        });
    });
};
exports.updateDeliveryStatus = updateDeliveryStatus;
