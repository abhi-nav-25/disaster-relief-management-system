import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { TaskStatus } from "@prisma/client";

import {
    createResourceDeliveryTask,
    getTask,
    getTeamTasks,
    changeTaskStatus,
} from "../services/taskService";

export const createTask = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const operatorId = req.user?.userId;

        if (!operatorId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const {
            teamId,
            resourceRequestId,
            title,
            description,
            locationAddress,
            latitude,
            longitude,
        } = req.body;

        const task =
            await createResourceDeliveryTask(
                operatorId,
                {
                    teamId: Number(teamId),
                    resourceRequestId:
                        Number(resourceRequestId),
                    title,
                    description,
                    locationAddress,
                    latitude,
                    longitude,
                }
            );

        return res.status(201).json({
            message: "Task created successfully",
            task,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to create task";

        return res.status(400).json({
            message,
        });
    }
};

export const getOneTask = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const taskId = Number(req.params.id);

        const task = await getTask(
            taskId,
            userId
        );

        return res.status(200).json({
            task,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Task not found";

        return res.status(404).json({
            message,
        });
    }
};

export const getMyTeamTasks = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const tasks =
            await getTeamTasks(userId);

        return res.status(200).json({
            tasks,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch team tasks";

        return res.status(400).json({
            message,
        });
    }
};

export const updateStatus = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const taskId = Number(req.params.id);
        const { status, outcome } = req.body;

        if (
            !Object.values(TaskStatus).includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid task status",
            });
        }

        const task =
            await changeTaskStatus(
                userId,
                taskId,
                status,
                outcome
            );

        return res.status(200).json({
            message: "Task status updated successfully",
            task,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update task status";

        return res.status(400).json({
            message,
        });
    }
};