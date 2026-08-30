import prisma from "../config/prisma";
import {
    RequestChannel,
    Priority,
} from "@prisma/client";

import {
    createResourceRequest,
    findRequestById,
    findRequestsByCamp,
    findAllResourceRequests,
    verifyResourceRequest,
    updateRequestPriority,
} from "../repositories/resourceRequestRepository";

export const createCampResourceRequest = async (
    userId: number,
    data: {
        channel: RequestChannel;
        description?: string;
        priority?: Priority;
        items: {
            resourceId: number;
            quantity: number;
            notes?: string;
        }[];
    }
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
            "Only a Relief Camp Manager can create a resource request"
        );
    }

    if (!user.managedCampId) {
        throw new Error(
            "Relief Camp Manager is not assigned to a camp"
        );
    }

    if (data.channel !== "ONLINE") {
        throw new Error(
            "Camp Managers can create only online requests"
        );
    }

    if (!data.items || data.items.length === 0) {
        throw new Error(
            "At least one resource is required"
        );
    }

    for (const item of data.items) {
        if (
            !Number.isInteger(item.resourceId) ||
            item.resourceId <= 0
        ) {
            throw new Error("Invalid resource ID");
        }

        if (
            !Number.isFinite(item.quantity) ||
            item.quantity <= 0
        ) {
            throw new Error(
                "Resource quantity must be greater than zero"
            );
        }
    }

    return createResourceRequest({
        campId: user.managedCampId,
        createdById: userId,
        channel: data.channel,
        description: data.description,
        priority: data.priority,
        items: data.items,
    });
};

export const getRequest = async (id: number) => {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid request ID");
    }

    const request = await findRequestById(id);

    if (!request) {
        throw new Error("Resource request not found");
    }

    return request;
};

export const getCampRequests = async (
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
            "Only a Relief Camp Manager can access this endpoint"
        );
    }

    if (!user.managedCampId) {
        throw new Error(
            "Relief Camp Manager is not assigned to a camp"
        );
    }

    return findRequestsByCamp(user.managedCampId);
};

export const getAllRequests = async () => {
    return findAllResourceRequests();
};

export const verifyRequest = async (
    requestId: number,
    operatorId: number,
    verificationStatus:
        | "VERIFIED"
        | "REJECTED"
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

    if (operator.role !== "CONTROL_CENTRE_OPERATOR") {
        throw new Error(
            "Only a Control Centre Operator can verify requests"
        );
    }

    const request = await findRequestById(requestId);

    if (!request) {
        throw new Error("Resource request not found");
    }

    if (request.verificationStatus !== "PENDING") {
        throw new Error(
            "Request has already been reviewed"
        );
    }

    return verifyResourceRequest(
        requestId,
        operatorId,
        verificationStatus
    );
};

export const setRequestPriority = async (
    requestId: number,
    priority: Priority,
    operatorId: number
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

    if (operator.role !== "CONTROL_CENTRE_OPERATOR") {
        throw new Error(
            "Only a Control Centre Operator can set priority"
        );
    }

    const request = await findRequestById(requestId);

    if (!request) {
        throw new Error("Resource request not found");
    }

    return updateRequestPriority(
        requestId,
        priority
    );
};