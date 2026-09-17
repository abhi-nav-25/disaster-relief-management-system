"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTeamStatus = exports.createTeam = exports.findTeamById = exports.findAllTeams = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const findAllTeams = async () => {
    return prisma_1.default.reliefTeam.findMany({
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
exports.findAllTeams = findAllTeams;
const findTeamById = async (id) => {
    return prisma_1.default.reliefTeam.findUnique({
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
exports.findTeamById = findTeamById;
const createTeam = async (data) => {
    return prisma_1.default.reliefTeam.create({
        data,
    });
};
exports.createTeam = createTeam;
const updateTeamStatus = async (id, status) => {
    return prisma_1.default.reliefTeam.update({
        where: {
            id,
        },
        data: {
            status,
        },
    });
};
exports.updateTeamStatus = updateTeamStatus;
