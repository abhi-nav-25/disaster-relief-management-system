import prisma from "../config/prisma";
import { DeliveryStatus } from "@prisma/client";
import { logAction } from "./auditLogService";
import {
    createDelivery,
    findDeliveryById,
    findDeliveriesByRequest,
    updateDeliveryStatus,
} from "../repositories/deliveryRepository";

export const createResourceDelivery = async (
    operatorId: number,
    data: {
        requestId: number;
        teamId: number;
        notes?: string;
        items: {
            resourceId: number;
            quantity: number;
        }[];
    }
) => {
    const operator = await prisma.user.findUnique({
        where: {
            id: operatorId,
        },
        select: {
            role: true,
        },
    });

    if (!operator) {
        throw new Error("User not found");
    }

    if (
        operator.role !==
        "CONTROL_CENTRE_OPERATOR"
    ) {
        throw new Error(
            "Only a Control Centre Operator can create deliveries"
        );
    }

    const request =
        await prisma.resourceRequest.findUnique({
            where: {
                id: data.requestId,
            },
            include: {
                items: true,
            },
        });

    if (!request) {
        throw new Error(
            "Resource request not found"
        );
    }

    if (
        request.status !== "ASSIGNED" &&
        request.status !== "IN_PROGRESS"
    ) {
        throw new Error(
            "Delivery can only be created for an assigned or in-progress request"
        );
    }

    const team =
        await prisma.reliefTeam.findUnique({
            where: {
                id: data.teamId,
            },
        });

    if (!team) {
        throw new Error(
            "Relief team not found"
        );
    }

    const assignment =
        await prisma.resourceRequestAssignment.findFirst({
            where: {
                requestId: data.requestId,
                teamId: data.teamId,
                unassignedAt: null,
            },
        });

    if (!assignment) {
        throw new Error(
            "This team is not assigned to the request"
        );
    }

    if (
        !Array.isArray(data.items) ||
        data.items.length === 0
    ) {
        throw new Error(
            "At least one delivery item is required"
        );
    }

    for (const item of data.items) {
        if (
            !Number.isInteger(item.resourceId) ||
            item.resourceId <= 0
        ) {
            throw new Error(
                "Invalid resource ID"
            );
        }

        if (
            !Number.isFinite(item.quantity) ||
            item.quantity <= 0
        ) {
            throw new Error(
                "Delivery quantity must be greater than zero"
            );
        }

        const requestedItem =
            request.items.find(
                (requestItem) =>
                    requestItem.resourceId ===
                    item.resourceId
            );

        if (!requestedItem) {
            throw new Error(
                `Resource ${item.resourceId} was not requested`
            );
        }

        if (
            item.quantity >
            Number(requestedItem.quantity)
        ) {
            throw new Error(
                `Delivery quantity exceeds requested quantity for resource ${item.resourceId}`
            );
        }
    }

    return createDelivery({
        requestId: data.requestId,
        campId: request.campId,
        teamId: data.teamId,
        notes: data.notes,
        items: data.items,
    });
};

export const getDelivery = async (
    deliveryId: number
) => {
    if (
        !Number.isInteger(deliveryId) ||
        deliveryId <= 0
    ) {
        throw new Error(
            "Invalid delivery ID"
        );
    }

    const delivery =
        await findDeliveryById(deliveryId);

    if (!delivery) {
        throw new Error(
            "Delivery not found"
        );
    }

    return delivery;
};

export const getRequestDeliveries = async (
    requestId: number
) => {
    if (
        !Number.isInteger(requestId) ||
        requestId <= 0
    ) {
        throw new Error(
            "Invalid request ID"
        );
    }

    return findDeliveriesByRequest(
        requestId
    );
};

export const changeDeliveryStatus = async (
    userId: number,
    deliveryId: number,
    status: DeliveryStatus
) => {
    const delivery =
        await findDeliveryById(deliveryId);

    if (!delivery) {
        throw new Error(
            "Delivery not found"
        );
    }

    const allowedTransitions: Record<
        DeliveryStatus,
        DeliveryStatus[]
    > = {
        PLANNED: [
            "IN_TRANSIT",
            "CANCELLED",
        ],
        IN_TRANSIT: [
            "DELIVERED",
            "PARTIALLY_DELIVERED",
            "FAILED",
        ],
        DELIVERED: [],
        PARTIALLY_DELIVERED: [],
        FAILED: [],
        CANCELLED: [],
    };

    if (
        !allowedTransitions[
            delivery.status
        ].includes(status)
    ) {
        throw new Error(
            `Invalid delivery status transition from ${delivery.status} to ${status}`
        );
    }

    const updatedDelivery =
        await updateDeliveryStatus(
            deliveryId,
            status
        );

    if (
        status === "DELIVERED" ||
        status === "PARTIALLY_DELIVERED"
    ) {
        await updateRequestFulfillmentStatus(
            updatedDelivery.requestId
        );
    }

    await logAction({
    action: "STATUS_CHANGE",
    entityType: "ResourceDelivery",
    entityId: deliveryId,
    performedById: userId,
    beforeData: {
        status: delivery.status,
    },
    afterData: {
        status: updatedDelivery.status,
    },
    description:
        `Resource delivery status changed from ${delivery.status} to ${updatedDelivery.status}`,
});

    return updatedDelivery;
};

const updateRequestFulfillmentStatus = async (
    requestId: number
) => {
    const request =
        await prisma.resourceRequest.findUnique({
            where: {
                id: requestId,
            },
            include: {
                items: true,
                deliveries: {
                    where: {
                        status: {
                            in: [
                                "DELIVERED",
                                "PARTIALLY_DELIVERED",
                            ],
                        },
                    },
                    include: {
                        items: true,
                    },
                },
            },
        });

    if (!request) {
        throw new Error(
            "Resource request not found"
        );
    }

    let allFulfilled = true;
    let anyFulfilled = false;

    for (const requestedItem of request.items) {
        let deliveredQuantity = 0;

        for (const delivery of request.deliveries) {
            const deliveredItem =
                delivery.items.find(
                    (item) =>
                        item.resourceId ===
                        requestedItem.resourceId
                );

            if (deliveredItem) {
                deliveredQuantity += Number(
                    deliveredItem.quantity
                );
            }
        }

        const requestedQuantity = Number(
            requestedItem.quantity
        );

        if (deliveredQuantity > 0) {
            anyFulfilled = true;
        }

        if (
            deliveredQuantity <
            requestedQuantity
        ) {
            allFulfilled = false;
        }
    }

    let status:
        | "PARTIALLY_FULFILLED"
        | "FULFILLED";

    if (allFulfilled) {
        status = "FULFILLED";
    } else if (anyFulfilled) {
        status = "PARTIALLY_FULFILLED";
    } else {
        return request;
    }

    return prisma.resourceRequest.update({
        where: {
            id: requestId,
        },
        data: {
            status,
        },
    });
};
