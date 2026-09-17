"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeDeliveryStatus = exports.getRequestDeliveries = exports.getDelivery = exports.createResourceDelivery = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const auditLogService_1 = require("./auditLogService");
const deliveryRepository_1 = require("../repositories/deliveryRepository");
const createResourceDelivery = async (operatorId, data) => {
    const operator = await prisma_1.default.user.findUnique({
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
    if (operator.role !==
        "CONTROL_CENTRE_OPERATOR") {
        throw new Error("Only a Control Centre Operator can create deliveries");
    }
    const request = await prisma_1.default.resourceRequest.findUnique({
        where: {
            id: data.requestId,
        },
        include: {
            items: true,
        },
    });
    if (!request) {
        throw new Error("Resource request not found");
    }
    if (request.status !== "ASSIGNED" &&
        request.status !== "IN_PROGRESS") {
        throw new Error("Delivery can only be created for an assigned or in-progress request");
    }
    const team = await prisma_1.default.reliefTeam.findUnique({
        where: {
            id: data.teamId,
        },
    });
    if (!team) {
        throw new Error("Relief team not found");
    }
    const assignment = await prisma_1.default.resourceRequestAssignment.findFirst({
        where: {
            requestId: data.requestId,
            teamId: data.teamId,
            unassignedAt: null,
        },
    });
    if (!assignment) {
        throw new Error("This team is not assigned to the request");
    }
    if (!Array.isArray(data.items) ||
        data.items.length === 0) {
        throw new Error("At least one delivery item is required");
    }
    for (const item of data.items) {
        if (!Number.isInteger(item.resourceId) ||
            item.resourceId <= 0) {
            throw new Error("Invalid resource ID");
        }
        if (!Number.isFinite(item.quantity) ||
            item.quantity <= 0) {
            throw new Error("Delivery quantity must be greater than zero");
        }
        const requestedItem = request.items.find((requestItem) => requestItem.resourceId ===
            item.resourceId);
        if (!requestedItem) {
            throw new Error(`Resource ${item.resourceId} was not requested`);
        }
        if (item.quantity >
            Number(requestedItem.quantity)) {
            throw new Error(`Delivery quantity exceeds requested quantity for resource ${item.resourceId}`);
        }
    }
    return (0, deliveryRepository_1.createDelivery)({
        requestId: data.requestId,
        campId: request.campId,
        teamId: data.teamId,
        notes: data.notes,
        items: data.items,
    });
};
exports.createResourceDelivery = createResourceDelivery;
const getDelivery = async (deliveryId) => {
    if (!Number.isInteger(deliveryId) ||
        deliveryId <= 0) {
        throw new Error("Invalid delivery ID");
    }
    const delivery = await (0, deliveryRepository_1.findDeliveryById)(deliveryId);
    if (!delivery) {
        throw new Error("Delivery not found");
    }
    return delivery;
};
exports.getDelivery = getDelivery;
const getRequestDeliveries = async (requestId) => {
    if (!Number.isInteger(requestId) ||
        requestId <= 0) {
        throw new Error("Invalid request ID");
    }
    return (0, deliveryRepository_1.findDeliveriesByRequest)(requestId);
};
exports.getRequestDeliveries = getRequestDeliveries;
const changeDeliveryStatus = async (userId, deliveryId, status) => {
    const delivery = await (0, deliveryRepository_1.findDeliveryById)(deliveryId);
    if (!delivery) {
        throw new Error("Delivery not found");
    }
    const user = await prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            role: true,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role === "RELIEF_TEAM") {
        const membership = await prisma_1.default.reliefTeamMember.findFirst({
            where: {
                userId,
                teamId: delivery.teamId,
            },
        });
        if (!membership) {
            throw new Error("You can only update deliveries assigned to your team");
        }
    }
    if (user.role !== "CONTROL_CENTRE_OPERATOR" &&
        user.role !== "RELIEF_TEAM") {
        throw new Error("You do not have permission to update delivery status");
    }
    const allowedTransitions = {
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
    if (!allowedTransitions[delivery.status].includes(status)) {
        throw new Error(`Invalid delivery status transition from ${delivery.status} to ${status}`);
    }
    const updatedDelivery = await (0, deliveryRepository_1.updateDeliveryStatus)(deliveryId, status);
    if (status === "DELIVERED" ||
        status === "PARTIALLY_DELIVERED") {
        await updateRequestFulfillmentStatus(updatedDelivery.requestId);
    }
    await (0, auditLogService_1.logAction)({
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
        description: `Resource delivery status changed from ${delivery.status} to ${updatedDelivery.status}`,
    });
    return updatedDelivery;
};
exports.changeDeliveryStatus = changeDeliveryStatus;
const updateRequestFulfillmentStatus = async (requestId) => {
    const request = await prisma_1.default.resourceRequest.findUnique({
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
        throw new Error("Resource request not found");
    }
    let allFulfilled = true;
    let anyFulfilled = false;
    for (const requestedItem of request.items) {
        let deliveredQuantity = 0;
        for (const delivery of request.deliveries) {
            const deliveredItem = delivery.items.find((item) => item.resourceId ===
                requestedItem.resourceId);
            if (deliveredItem) {
                deliveredQuantity += Number(deliveredItem.quantity);
            }
        }
        const requestedQuantity = Number(requestedItem.quantity);
        if (deliveredQuantity > 0) {
            anyFulfilled = true;
        }
        if (deliveredQuantity <
            requestedQuantity) {
            allFulfilled = false;
        }
    }
    let status;
    if (allFulfilled) {
        status = "FULFILLED";
    }
    else if (anyFulfilled) {
        status = "PARTIALLY_FULFILLED";
    }
    else {
        return request;
    }
    return prisma_1.default.resourceRequest.update({
        where: {
            id: requestId,
        },
        data: {
            status,
        },
    });
};
