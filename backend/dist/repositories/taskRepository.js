"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskStatus = exports.findTasksByTeam = exports.findTaskById = exports.createTask = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createTask = async (data) => {
    return prisma_1.default.task.create({
        data,
        include: {
            team: true,
            resourceRequest: true,
            assignedBy: true,
        },
    });
};
exports.createTask = createTask;
const findTaskById = async (id) => {
    return prisma_1.default.task.findUnique({
        where: {
            id,
        },
        include: {
            team: true,
            resourceRequest: {
                include: {
                    items: {
                        include: {
                            resource: true,
                        },
                    },
                    camp: true,
                },
            },
            updates: {
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });
};
exports.findTaskById = findTaskById;
const findTasksByTeam = async (teamId) => {
    return prisma_1.default.task.findMany({
        where: {
            teamId,
        },
        include: {
            resourceRequest: true,
            updates: {
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.findTasksByTeam = findTasksByTeam;
const updateTaskStatus = async (taskId, updatedById, status, outcome) => {
    return prisma_1.default.$transaction(async (tx) => {
        const now = new Date();
        const data = {
            status,
            outcome,
        };
        if (status === "ACCEPTED") {
            data.acceptedAt = now;
        }
        if (status === "IN_PROGRESS") {
            data.startedAt = now;
        }
        if (status === "COMPLETED" ||
            status === "FAILED" ||
            status === "CANCELLED") {
            data.completedAt = now;
        }
        const task = await tx.task.update({
            where: {
                id: taskId,
            },
            data,
        });
        await tx.taskUpdate.create({
            data: {
                taskId,
                updatedById,
                status,
                outcome,
            },
        });
        return task;
    });
};
exports.updateTaskStatus = updateTaskStatus;
