"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequestAssignments = exports.assignTeam = exports.getTeams = void 0;
const requestAssignmentService_1 = require("../services/requestAssignmentService");
const getTeams = async (req, res) => {
    try {
        const teams = await (0, requestAssignmentService_1.getAvailableTeams)();
        return res.status(200).json({
            teams,
        });
    }
    catch {
        return res.status(500).json({
            message: "Failed to fetch available teams",
        });
    }
};
exports.getTeams = getTeams;
const assignTeam = async (req, res) => {
    try {
        const operatorId = req.user?.userId;
        if (!operatorId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const requestId = Number(req.params.requestId);
        const teamId = Number(req.params.teamId);
        if (!Number.isInteger(requestId) ||
            requestId <= 0 ||
            !Number.isInteger(teamId) ||
            teamId <= 0) {
            return res.status(400).json({
                message: "Invalid request or team ID",
            });
        }
        const { notes } = req.body;
        const assignment = await (0, requestAssignmentService_1.assignRequestToTeam)(requestId, teamId, operatorId, notes);
        return res.status(201).json({
            message: "Relief team assigned successfully",
            assignment,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to assign relief team";
        return res.status(400).json({
            message,
        });
    }
};
exports.assignTeam = assignTeam;
const getRequestAssignments = async (req, res) => {
    try {
        const requestId = Number(req.params.requestId);
        if (!Number.isInteger(requestId) ||
            requestId <= 0) {
            return res.status(400).json({
                message: "Invalid request ID",
            });
        }
        const assignments = await (0, requestAssignmentService_1.getAssignments)(requestId);
        return res.status(200).json({
            assignments,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to fetch assignments";
        return res.status(400).json({
            message,
        });
    }
};
exports.getRequestAssignments = getRequestAssignments;
