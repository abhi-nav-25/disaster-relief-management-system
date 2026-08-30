import prisma from "../config/prisma";
import { TaskStatus, TaskType } from "@prisma/client";

export const createTask = async (data: {
    teamId: number;
    assignedById: number;
    resourceRequestId?: number;
    type: TaskType;
    title: string;
    description?: string;
    locationAddress?: string;
    latitude?: number;
    longitude?: number;
}) => {
    return prisma.task.create({
        data,
        include: {
            team: true,
            resourceRequest: true,
            assignedBy: true,
        },
    });
};

export const findTaskById = async (id: number) => {
    return prisma.task.findUnique({
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

export const findTasksByTeam = async (
    teamId: number
) => {
    return prisma.task.findMany({
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

export const updateTaskStatus = async (
    taskId: number,
    updatedById: number,
    status: TaskStatus,
    outcome?: string
) => {
    return prisma.$transaction(async (tx) => {
        const now = new Date();

        const data: {
            status: TaskStatus;
            outcome?: string;
            acceptedAt?: Date;
            startedAt?: Date;
            completedAt?: Date;
        } = {
            status,
            outcome,
        };

        if (status === "ACCEPTED") {
            data.acceptedAt = now;
        }

        if (status === "IN_PROGRESS") {
            data.startedAt = now;
        }

        if (
            status === "COMPLETED" ||
            status === "FAILED" ||
            status === "CANCELLED"
        ) {
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