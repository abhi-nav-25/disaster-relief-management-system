import prisma from "../config/prisma";
import { TaskStatus, TaskType } from "@prisma/client";
import { logAction } from "./auditLogService";
import {
    createTask,
    findTaskById,
    findTasksByTeam,
    updateTaskStatus,
} from "../repositories/taskRepository";

export const createResourceDeliveryTask = async (
    operatorId: number,
    data: {
        teamId: number;
        resourceRequestId: number;
        title: string;
        description?: string;
        locationAddress?: string;
        latitude?: number;
        longitude?: number;
    }
) => {
    const operator = await prisma.user.findUnique({
        where: {
            id: operatorId,
        },
        select: {
            role: true,
        },
    });

    if (!operator) {
        throw new Error("User not found");
    }

    if (
        operator.role !==
        "CONTROL_CENTRE_OPERATOR"
    ) {
        throw new Error(
            "Only a Control Centre Operator can create tasks"
        );
    }

    const request =
        await prisma.resourceRequest.findUnique({
            where: {
                id: data.resourceRequestId,
            },
        });

    if (!request) {
        throw new Error(
            "Resource request not found"
        );
    }

    if (
        request.status !== "ASSIGNED"
    ) {
        throw new Error(
            "A task can only be created for an assigned request"
        );
    }
    const assignment =
        await prisma.resourceRequestAssignment.findFirst({
            where: {
                requestId: data.resourceRequestId,
                teamId: data.teamId,
                unassignedAt: null,
            },
        });

    if (!assignment) {
        throw new Error(
            "Selected team is not assigned to this request"
        );
    }
    const team =
        await prisma.reliefTeam.findUnique({
            where: {
                id: data.teamId,
            },
        });

    if (!team) {
        throw new Error(
            "Relief team not found"
        );
    }

    if (team.status !== "BUSY") {
        throw new Error(
            "The assigned team must be BUSY"
        );
    }

    return createTask({
        teamId: data.teamId,
        assignedById: operatorId,
        resourceRequestId:
            data.resourceRequestId,
        type: TaskType.RESOURCE_DELIVERY,
        title: data.title,
        description: data.description,
        locationAddress:
            data.locationAddress,
        latitude: data.latitude,
        longitude: data.longitude,
    });
};

export const getTask = async (
    taskId: number,
    userId: number
) => {
    if (!Number.isInteger(taskId) || taskId <= 0) {
        throw new Error("Invalid task ID");
    }

    const task = await findTaskById(taskId);

    if (!task) {
        throw new Error("Task not found");
    }
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            role: true,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.role === "RELIEF_TEAM") {
        const membership =
            await prisma.reliefTeamMember.findFirst({
                where: {
                    userId,
                    teamId: task.teamId,
                },
            });

        if (!membership) {
            throw new Error(
                "You can only view tasks assigned to your team"
            );
        }
    }
    return task;
};

export const getTeamTasks = async (
    userId: number
) => {
    const membership =
        await prisma.reliefTeamMember.findFirst({
            where: {
                userId,
            },
            select: {
                teamId: true,
            },
        });

    if (!membership) {
        throw new Error(
            "User is not a member of a relief team"
        );
    }

    return findTasksByTeam(
        membership.teamId
    );
};

export const changeTaskStatus = async (
    userId: number,
    taskId: number,
    status: TaskStatus,
    outcome?: string
) => {
    const membership =
        await prisma.reliefTeamMember.findFirst({
            where: {
                userId,
            },
            select: {
                teamId: true,
            },
        });

    if (!membership) {
        throw new Error(
            "User is not a member of a relief team"
        );
    }

    const task = await findTaskById(taskId);

    if (!task) {
        throw new Error("Task not found");
    }

    if (
        task.teamId !== membership.teamId
    ) {
        throw new Error(
            "You can only update tasks assigned to your team"
        );
    }

    const allowedTransitions: Record<
        TaskStatus,
        TaskStatus[]
    > = {
        ASSIGNED: ["ACCEPTED", "CANCELLED"],
        ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
        IN_PROGRESS: ["COMPLETED", "FAILED"],
        COMPLETED: [],
        FAILED: [],
        CANCELLED: [],
    };

    if (
        !allowedTransitions[
            task.status
        ].includes(status)
    ) {
        throw new Error(
            `Invalid task status transition from ${task.status} to ${status}`
        );
    }

    const updatedTask =
        await updateTaskStatus(
            taskId,
            userId,
            status,
            outcome
        );

    await logAction({
        action: "STATUS_CHANGE",
        entityType: "Task",
        entityId: taskId,
        performedById: userId,
        beforeData: {
            status: task.status,
        },
        afterData: {
            status: updatedTask.status,
        },
        description:
            `Task status changed from ${task.status} to ${updatedTask.status}`,
    });

    return updatedTask;
};