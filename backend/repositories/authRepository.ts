import prisma from "../config/prisma";

export const findUserByEmail = async (email: string) => {
    return prisma.user.findUnique({
        where: {
            email,
        },
    });
};

export const findUserById = async (id: number) => {
    return prisma.user.findUnique({
        where: {
            id,
        },
        include: {
            managedCamp: true,
            teamMemberships: {
                include: {
                    team: true,
                },
            },
        },
    });
};

export const createUser = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role:
        | "CITIZEN"
        | "RELIEF_CAMP_MANAGER"
        | "CONTROL_CENTRE_OPERATOR"
        | "DMA_SUPERVISOR"
        | "RELIEF_TEAM";
    managedCampId?: number;
}) => {
    return prisma.user.create({
        data,
    });
};