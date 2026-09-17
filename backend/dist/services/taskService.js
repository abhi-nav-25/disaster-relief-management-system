"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeTaskStatus = exports.getTeamTasks = exports.getTask = exports.createResourceDeliveryTask = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
const auditLogService_1 = require("./auditLogService");
const taskRepository_1 = require("../repositories/taskRepository");
const createResourceDeliveryTask = async (operatorId, data) => {
    const operator = await prisma_1.default.user.findUnique({
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
    if (operator.role !==
        "CONTROL_CENTRE_OPERATOR") {
        throw new Error("Only a Control Centre Operator can create tasks");
    }
    const request = await prisma_1.default.resourceRequest.findUnique({
        where: {
            id: data.resourceRequestId,
        },
    });
    if (!request) {
        throw new Error("Resource request not found");
    }
    if (request.status !== "ASSIGNED") {
        throw new Error("A task can only be created for an assigned request");
    }
    const assignment = await prisma_1.default.resourceRequestAssignment.findFirst({
        where: {
            requestId: data.resourceRequestId,
            teamId: data.teamId,
            unassignedAt: null,
        },
    });
    if (!assignment) {
        throw new Error("Selected team is not assigned to this request");
    }
    const team = await prisma_1.default.reliefTeam.findUnique({
        where: {
            id: data.teamId,
        },
    });
    if (!team) {
        throw new Error("Relief team not found");
    }
    if (team.status !== "BUSY") {
        throw new Error("The assigned team must be BUSY");
    }
    return (0, taskRepository_1.createTask)({
        teamId: data.teamId,
        assignedById: operatorId,
        resourceRequestId: data.resourceRequestId,
        type: client_1.TaskType.RESOURCE_DELIVERY,
        title: data.title,
        description: data.description,
        locationAddress: data.locationAddress,
        latitude: data.latitude,
        longitude: data.longitude,
    });
};
exports.createResourceDeliveryTask = createResourceDeliveryTask;
const getTask = async (taskId, userId) => {
    if (!Number.isInteger(taskId) || taskId <= 0) {
        throw new Error("Invalid task ID");
    }
    const task = await (0, taskRepository_1.findTaskById)(taskId);
    if (!task) {
        throw new Error("Task not found");
    }
    const user = await prisma_1.default.user.findUnique({
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
        const membership = await prisma_1.default.reliefTeamMember.findFirst({
            where: {
                userId,
                teamId: task.teamId,
            },
        });
        if (!membership) {
            throw new Error("You can only view tasks assigned to your team");
        }
    }
    return task;
};
exports.getTask = getTask;
const getTeamTasks = async (userId) => {
    const membership = await prisma_1.default.reliefTeamMember.findFirst({
        where: {
            userId,
        },
        select: {
            teamId: true,
        },
    });
    if (!membership) {
        throw new Error("User is not a member of a relief team");
    }
    return (0, taskRepository_1.findTasksByTeam)(membership.teamId);
};
exports.getTeamTasks = getTeamTasks;
const changeTaskStatus = async (userId, taskId, status, outcome) => {
    const membership = await prisma_1.default.reliefTeamMember.findFirst({
        where: {
            userId,
        },
        select: {
            teamId: true,
        },
    });
    if (!membership) {
        throw new Error("User is not a member of a relief team");
    }
    const task = await (0, taskRepository_1.findTaskById)(taskId);
    if (!task) {
        throw new Error("Task not found");
    }
    if (task.teamId !== membership.teamId) {
        throw new Error("You can only update tasks assigned to your team");
    }
    const allowedTransitions = {
        ASSIGNED: ["ACCEPTED", "CANCELLED"],
        ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
        IN_PROGRESS: ["COMPLETED", "FAILED"],
        COMPLETED: [],
        FAILED: [],
        CANCELLED: [],
    };
    if (!allowedTransitions[task.status].includes(status)) {
        throw new Error(`Invalid task status transition from ${task.status} to ${status}`);
    }
    const updatedTask = await (0, taskRepository_1.updateTaskStatus)(taskId, userId, status, outcome);
    await (0, auditLogService_1.logAction)({
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
        description: `Task status changed from ${task.status} to ${updatedTask.status}`,
    });
    return updatedTask;
};
exports.changeTaskStatus = changeTaskStatus;
