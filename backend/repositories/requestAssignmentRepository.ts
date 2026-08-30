import prisma from "../config/prisma";

export const findAvailableTeams = async () => {
    return prisma.reliefTeam.findMany({
        where: {
            status: "AVAILABLE",
        },
        include: {
            members: {
                include: {
                    user: true,
                },
            },
        },
        orderBy: {
            teamName: "asc",
        },
    });
};

export const createRequestAssignment = async (
    requestId: number,
    teamId: number,
    assignedById: number,
    notes?: string
) => {
    return prisma.$transaction(async (tx) => {
        const assignment =
            await tx.resourceRequestAssignment.create({
                data: {
                    requestId,
                    teamId,
                    assignedById,
                    notes,
                },
                include: {
                    request: true,
                    team: true,
                    assignedBy: true,
                },
            });

        await tx.resourceRequest.update({
            where: {
                id: requestId,
            },
            data: {
                status: "ASSIGNED",
            },
        });

        await tx.reliefTeam.update({
            where: {
                id: teamId,
            },
            data: {
                status: "BUSY",
            },
        });

        return assignment;
    });
};

export const findRequestAssignments = async (
    requestId: number
) => {
    return prisma.resourceRequestAssignment.findMany({
        where: {
            requestId,
        },
        include: {
            team: true,
            assignedBy: true,
        },
        orderBy: {
            assignedAt: "desc",
        },
    });
};