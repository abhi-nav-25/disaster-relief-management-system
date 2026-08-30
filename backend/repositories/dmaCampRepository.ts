import prisma from "../config/prisma";

export const updateOfficialCampData = async (
    campId: number,
    data: {
        officialCode?: string;
        name?: string;
        address?: string;
        latitude?: number;
        longitude?: number;
        capacity?: number;
    }
) => {
    return prisma.reliefCamp.update({
        where: {
            id: campId,
        },
        data,
    });
};