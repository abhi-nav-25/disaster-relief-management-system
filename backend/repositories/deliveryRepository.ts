import prisma from "../config/prisma";
import { DeliveryStatus } from "@prisma/client";

export const createDelivery = async (data: {
    requestId: number;
    campId: number;
    teamId: number;
    notes?: string;
    items: {
        resourceId: number;
        quantity: number;
    }[];
}) => {
    return prisma.resourceDelivery.create({
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

export const findDeliveryById = async (
    id: number
) => {
    return prisma.resourceDelivery.findUnique({
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

export const findDeliveriesByRequest = async (
    requestId: number
) => {
    return prisma.resourceDelivery.findMany({
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

export const updateDeliveryStatus = async (
    id: number,
    status: DeliveryStatus
) => {
    return prisma.$transaction(async (tx) => {
        const delivery =
            await tx.resourceDelivery.findUnique({
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

        const data: {
            status: DeliveryStatus;
            dispatchedAt?: Date;
            deliveredAt?: Date;
        } = {
            status,
        };

        if (status === "IN_TRANSIT") {
            data.dispatchedAt = new Date();
        }

        if (
            status === "DELIVERED" ||
            status === "PARTIALLY_DELIVERED"
        ) {
            data.deliveredAt = new Date();
        }

        // Update inventory when resources are delivered.
        if (
            status === "DELIVERED" ||
            status === "PARTIALLY_DELIVERED"
        ) {
            for (const item of delivery.items) {
                const inventory =
                    await tx.campInventory.findUnique({
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
                } else {
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