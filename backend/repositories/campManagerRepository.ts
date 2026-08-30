import prisma from "../config/prisma";
import { CampOperationalStatus } from "@prisma/client";

export const updateCampOperationalInfo = async (
    campId: number,
    data: {
        currentOccupancy?: number;
        operationalStatus?: CampOperationalStatus;
        operationalNotes?: string;
    }
) => {
    return prisma.reliefCamp.update({
        where: {
            id: campId,
        },
        data,
    });
};