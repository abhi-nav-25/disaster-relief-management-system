import prisma from "../config/prisma";

export const findAllCamps = async () => {
    return prisma.reliefCamp.findMany({
        orderBy: {
            name: "asc",
        },
    });
};

export const findCampById = async (id: number) => {
    return prisma.reliefCamp.findUnique({
        where: {
            id,
        },
    });
};

export const findNearestCamps = async (
    latitude: number,
    longitude: number
) => {
    return prisma.$queryRaw<
        Array<{
            id: number;
            officialCode: string;
            name: string;
            address: string;
            latitude: number;
            longitude: number;
            capacity: number;
            currentOccupancy: number;
            operationalStatus: string;
            distanceKm: number;
        }>
    >`
        SELECT
            id,
            "officialCode",
            name,
            address,
            latitude,
            longitude,
            capacity,
            "currentOccupancy",
            "operationalStatus",
            (
                6371 * acos(
                    cos(radians(${latitude}))
                    * cos(radians(latitude))
                    * cos(radians(longitude) - radians(${longitude}))
                    + sin(radians(${latitude}))
                    * sin(radians(latitude))
                )
            ) AS "distanceKm"
        FROM "ReliefCamp"
        WHERE "operationalStatus" = 'OPERATIONAL'
        ORDER BY "distanceKm" ASC
        LIMIT 3;
    `;
};