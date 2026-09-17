"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findNearestCamps = exports.findCampById = exports.findAllCamps = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const findAllCamps = async () => {
    return prisma_1.default.reliefCamp.findMany({
        orderBy: {
            name: "asc",
        },
    });
};
exports.findAllCamps = findAllCamps;
const findCampById = async (id) => {
    return prisma_1.default.reliefCamp.findUnique({
        where: {
            id,
        },
    });
};
exports.findCampById = findCampById;
const findNearestCamps = async (latitude, longitude) => {
    return prisma_1.default.$queryRaw `
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
exports.findNearestCamps = findNearestCamps;
