import prisma from "../config/prisma";
import {
    updateCampOperationalInfo,
} from "../repositories/campManagerRepository";
import { CampOperationalStatus } from "@prisma/client";

export const updateOwnCampOperationalInfo = async (
    userId: number,
    data: {
        currentOccupancy?: number;
        operationalStatus?: CampOperationalStatus;
        operationalNotes?: string;
    }
) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            managedCampId: true,
            role: true,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.role !== "RELIEF_CAMP_MANAGER") {
        throw new Error(
            "Only a Relief Camp Manager can update camp operations"
        );
    }

    if (!user.managedCampId) {
        throw new Error(
            "Relief Camp Manager is not assigned to a camp"
        );
    }

    if (
        data.currentOccupancy !== undefined &&
        data.currentOccupancy < 0
    ) {
        throw new Error(
            "Current occupancy cannot be negative"
        );
    }

    return updateCampOperationalInfo(
        user.managedCampId,
        data
    );
};