"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatus = exports.getMyTeamTasks = exports.getOneTask = exports.createTask = void 0;
const client_1 = require("@prisma/client");
const taskService_1 = require("../services/taskService");
const createTask = async (req, res) => {
    try {
        const operatorId = req.user?.userId;
        if (!operatorId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const { teamId, resourceRequestId, title, description, locationAddress, latitude, longitude, } = req.body;
        const task = await (0, taskService_1.createResourceDeliveryTask)(operatorId, {
            teamId: Number(teamId),
            resourceRequestId: Number(resourceRequestId),
            title,
            description,
            locationAddress,
            latitude,
            longitude,
        });
        return res.status(201).json({
            message: "Task created successfully",
            task,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to create task";
        return res.status(400).json({
            message,
        });
    }
};
exports.createTask = createTask;
const getOneTask = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const taskId = Number(req.params.id);
        const task = await (0, taskService_1.getTask)(taskId, userId);
        return res.status(200).json({
            task,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Task not found";
        return res.status(404).json({
            message,
        });
    }
};
exports.getOneTask = getOneTask;
const getMyTeamTasks = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const tasks = await (0, taskService_1.getTeamTasks)(userId);
        return res.status(200).json({
            tasks,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to fetch team tasks";
        return res.status(400).json({
            message,
        });
    }
};
exports.getMyTeamTasks = getMyTeamTasks;
const updateStatus = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const taskId = Number(req.params.id);
        const { status, outcome } = req.body;
        if (!Object.values(client_1.TaskStatus).includes(status)) {
            return res.status(400).json({
                message: "Invalid task status",
            });
        }
        const task = await (0, taskService_1.changeTaskStatus)(userId, taskId, status, outcome);
        return res.status(200).json({
            message: "Task status updated successfully",
            task,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to update task status";
        return res.status(400).json({
            message,
        });
    }
};
exports.updateStatus = updateStatus;
