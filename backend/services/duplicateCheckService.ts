import prisma from "../config/prisma";
import { DuplicateDecision } from "@prisma/client";

import {
    findSimilarRequests,
    createDuplicateCheck,
    findDuplicateChecks,
    reviewDuplicateCheck,
} from "../repositories/duplicateCheckRepository";

export const detectPossibleDuplicates = async (
    requestId: number
) => {
    const request = await prisma.resourceRequest.findUnique({
        where: {
            id: requestId,
        },
        include: {
            items: true,
        },
    });

    if (!request) {
        throw new Error("Resource request not found");
    }

    const existingRequests =
        await findSimilarRequests(
            request.campId,
            requestId
        );

    const possibleDuplicates = [];

    for (const existing of existingRequests) {
        const requestedResourceIds =
            new Set(
                request.items.map(
                    (item) => item.resourceId
                )
            );

        const matchingItems =
            existing.items.filter((item) =>
                requestedResourceIds.has(
                    item.resourceId
                )
            );

        if (matchingItems.length === 0) {
            continue;
        }

        const totalRequested =
            request.items.length;

        const matchingCount =
            matchingItems.length;

        const matchRatio =
            matchingCount / totalRequested;

        if (matchRatio >= 0.5) {
            const reason =
                `Possible duplicate: ${matchingCount} ` +
                `of ${totalRequested} requested resources ` +
                `overlap with request #${existing.id}.`;

            const duplicateCheck =
                await createDuplicateCheck(
                    requestId,
                    existing.id,
                    reason
                );

            possibleDuplicates.push(
                duplicateCheck
            );
        }
    }

    return possibleDuplicates;
};

export const getDuplicateChecks = async (
    requestId: number
) => {
    return findDuplicateChecks(requestId);
};

export const decideDuplicate = async (
    checkId: number,
    operatorId: number,
    decision: DuplicateDecision
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
            "Only a Control Centre Operator can review duplicates"
        );
    }

    return reviewDuplicateCheck(
        checkId,
        operatorId,
        decision
    );
};