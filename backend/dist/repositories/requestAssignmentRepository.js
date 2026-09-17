"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRequestAssignments = exports.createRequestAssignment = exports.findAvailableTeams = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const findAvailableTeams = async () => {
    return prisma_1.default.reliefTeam.findMany({
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
exports.findAvailableTeams = findAvailableTeams;
const createRequestAssignment = async (requestId, teamId, assignedById, notes) => {
    return prisma_1.default.$transaction(async (tx) => {
        const assignment = await tx.resourceRequestAssignment.create({
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
exports.createRequestAssignment = createRequestAssignment;
const findRequestAssignments = async (requestId) => {
    return prisma_1.default.resourceRequestAssignment.findMany({
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
exports.findRequestAssignments = findRequestAssignments;
