import prisma from "../config/prisma";

export const findAllResources = async () => {
    return prisma.resource.findMany({
        orderBy: {
            name: "asc",
        },
    });
};

export const findResourceById = async (id: number) => {
    return prisma.resource.findUnique({
        where: {
            id,
        },
    });
};

export const createResource = async (data: {
    name: string;
    description?: string;
    unit: string;
}) => {
    return prisma.resource.create({
        data,
    });
};

export const updateResource = async (
    id: number,
    data: {
        name?: string;
        description?: string;
        unit?: string;
        isActive?: boolean;
    }
) => {
    return prisma.resource.update({
        where: {
            id,
        },
        data,
    });
};