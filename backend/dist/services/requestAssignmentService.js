"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssignments = exports.assignRequestToTeam = exports.getAvailableTeams = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const requestAssignmentRepository_1 = require("../repositories/requestAssignmentRepository");
const auditLogService_1 = require("./auditLogService");
const getAvailableTeams = async () => {
    return (0, requestAssignmentRepository_1.findAvailableTeams)();
};
exports.getAvailableTeams = getAvailableTeams;
const assignRequestToTeam = async (requestId, teamId, operatorId, notes) => {
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
    if (operator.role !== "CONTROL_CENTRE_OPERATOR") {
        throw new Error("Only a Control Centre Operator can assign teams");
    }
    const request = await prisma_1.default.resourceRequest.findUnique({
        where: {
            id: requestId,
        },
    });
    if (!request) {
        throw new Error("Resource request not found");
    }
    if (request.verificationStatus !== "VERIFIED") {
        throw new Error("Only verified requests can be assigned");
    }
    if (request.status !== "PENDING") {
        throw new Error("Only pending requests can be assigned");
    }
    const team = await prisma_1.default.reliefTeam.findUnique({
        where: {
            id: teamId,
        },
    });
    if (!team) {
        throw new Error("Relief team not found");
    }
    if (team.status !== "AVAILABLE") {
        throw new Error("Selected relief team is not available");
    }
    const assignment = await (0, requestAssignmentRepository_1.createRequestAssignment)(requestId, teamId, operatorId, notes);
    await (0, auditLogService_1.logAction)({
        action: "ASSIGN",
        entityType: "ResourceRequest",
        entityId: requestId,
        performedById: operatorId,
        afterData: {
            teamId,
            assignmentId: assignment.id,
        },
        description: `Relief team ${teamId} assigned to resource request ${requestId}`,
    });
    return assignment;
};
exports.assignRequestToTeam = assignRequestToTeam;
const getAssignments = async (requestId) => {
    const request = await prisma_1.default.resourceRequest.findUnique({
        where: {
            id: requestId,
        },
    });
    if (!request) {
        throw new Error("Resource request not found");
    }
    return (0, requestAssignmentRepository_1.findRequestAssignments)(requestId);
};
exports.getAssignments = getAssignments;
