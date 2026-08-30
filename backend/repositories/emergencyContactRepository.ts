import prisma from "../config/prisma";

export const findAllEmergencyContacts = async () => {
    return prisma.emergencyContact.findMany({
        orderBy: {
            name: "asc",
        },
    });
};