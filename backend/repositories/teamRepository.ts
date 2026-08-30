import prisma from "../config/prisma";

export const findAllTeams = async () => {
    return prisma.reliefTeam.findMany({
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

export const findTeamById = async (id: number) => {
    return prisma.reliefTeam.findUnique({
        where: {
            id,
        },
        include: {
            members: {
                include: {
                    user: true,
                },
            },
        },
    });
};

export const createTeam = async (data: {
    teamName: string;
    contactNumber: string;
}) => {
    return prisma.reliefTeam.create({
        data,
    });
};

export const updateTeamStatus = async (
    id: number,
    status: "AVAILABLE" | "BUSY" | "OFFLINE"
) => {
    return prisma.reliefTeam.update({
        where: {
            id,
        },
        data: {
            status,
        },
    });
};