import prisma from "../config/prisma";
import { DuplicateDecision } from "@prisma/client";

export const findSimilarRequests = async (
    campId: number,
    requestId: number
) => {
    return prisma.resourceRequest.findMany({
        where: {
            campId,
            id: {
                not: requestId,
            },
            status: {
                in: ["PENDING", "ASSIGNED", "IN_PROGRESS"],
            },
        },
        include: {
            items: {
                include: {
                    resource: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const createDuplicateCheck = async (
    requestId: number,
    possibleDuplicateId: number,
    reason?: string
) => {
    return prisma.requestDuplicateCheck.create({
        data: {
            originalRequest: {
                connect: {
                    id: requestId,
                },
            },
            possibleDuplicateRequest: {
                connect: {
                    id: possibleDuplicateId,
                },
            },
            reason,
        },
    });
};

export const findDuplicateChecks = async (
    requestId: number
) => {
    return prisma.requestDuplicateCheck.findMany({
        where: {
            originalRequestId: requestId,
        },
        include: {
            possibleDuplicateRequest: true,
        },
    });
};

export const reviewDuplicateCheck = async (
    checkId: number,
    reviewedById: number,
    decision: DuplicateDecision
) => {
    return prisma.requestDuplicateCheck.update({
        where: {
            id: checkId,
        },
        data: {
            decision,
            reviewedBy: {
                connect: {
                    id: reviewedById,
                },
            },
            reviewedAt: new Date(),
        },
    });
};