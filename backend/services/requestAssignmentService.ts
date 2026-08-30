import prisma from "../config/prisma";

import {
    findAvailableTeams,
    createRequestAssignment,
    findRequestAssignments,
} from "../repositories/requestAssignmentRepository";

export const getAvailableTeams = async () => {
    return findAvailableTeams();
};

export const assignRequestToTeam = async (
    requestId: number,
    teamId: number,
    operatorId: number,
    notes?: string
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
        operator.role !== "CONTROL_CENTRE_OPERATOR"
    ) {
        throw new Error(
            "Only a Control Centre Operator can assign teams"
        );
    }

    const request =
        await prisma.resourceRequest.findUnique({
            where: {
                id: requestId,
            },
        });

    if (!request) {
        throw new Error(
            "Resource request not found"
        );
    }

    if (
        request.verificationStatus !== "VERIFIED"
    ) {
        throw new Error(
            "Only verified requests can be assigned"
        );
    }

    if (request.status !== "PENDING") {
        throw new Error(
            "Only pending requests can be assigned"
        );
    }

    const team = await prisma.reliefTeam.findUnique({
        where: {
            id: teamId,
        },
    });

    if (!team) {
        throw new Error("Relief team not found");
    }

    if (team.status !== "AVAILABLE") {
        throw new Error(
            "Selected relief team is not available"
        );
    }

    return createRequestAssignment(
        requestId,
        teamId,
        operatorId,
        notes
    );
};

export const getAssignments = async (
    requestId: number
) => {
    const request =
        await prisma.resourceRequest.findUnique({
            where: {
                id: requestId,
            },
        });

    if (!request) {
        throw new Error(
            "Resource request not found"
        );
    }

    return findRequestAssignments(requestId);
};