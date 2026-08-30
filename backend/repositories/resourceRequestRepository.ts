import prisma from "../config/prisma";
import {
    RequestChannel,
    RequestVerificationStatus,
    Priority,
} from "@prisma/client";

export const createResourceRequest = async (data: {
    campId: number;
    createdById?: number;
    channel: RequestChannel;
    description?: string;
    priority?: Priority;
    items: {
        resourceId: number;
        quantity: number;
        notes?: string;
    }[];
}) => {
    return prisma.resourceRequest.create({
        data: {
            campId: data.campId,
            createdById: data.createdById,
            channel: data.channel,
            description: data.description,
            priority: data.priority,
            items: {
                create: data.items.map((item) => ({
                    resourceId: item.resourceId,
                    quantity: item.quantity,
                    notes: item.notes,
                })),
            },
        },
        include: {
            items: {
                include: {
                    resource: true,
                },
            },
            camp: true,
        },
    });
};

export const findRequestById = async (id: number) => {
    return prisma.resourceRequest.findUnique({
        where: {
            id,
        },
        include: {
            camp: true,
            items: {
                include: {
                    resource: true,
                },
            },
            assignments: {
                include: {
                    team: true,
                    assignedBy: true,
                },
            },
        },
    });
};

export const findRequestsByCamp = async (
    campId: number
) => {
    return prisma.resourceRequest.findMany({
        where: {
            campId,
        },
        include: {
            items: {
                include: {
                    resource: true,
                },
            },
            assignments: {
                include: {
                    team: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const findAllResourceRequests = async () => {
    return prisma.resourceRequest.findMany({
        include: {
            camp: true,
            items: {
                include: {
                    resource: true,
                },
            },
            assignments: {
                include: {
                    team: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const verifyResourceRequest = async (
    id: number,
    verifiedById: number,
    verificationStatus: RequestVerificationStatus
) => {
    return prisma.resourceRequest.update({
        where: {
            id,
        },
        data: {
            verificationStatus,
            verifiedById,
            verifiedAt: new Date(),
        },
    });
};

export const updateRequestPriority = async (
    id: number,
    priority: Priority
) => {
    return prisma.resourceRequest.update({
        where: {
            id,
        },
        data: {
            priority,
        },
    });
};