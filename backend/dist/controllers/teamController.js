"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatus = exports.create = exports.getOneTeam = exports.getAllTeams = void 0;
const teamService_1 = require("../services/teamService");
const getAllTeams = async (req, res) => {
    try {
        const teams = await (0, teamService_1.getTeams)();
        return res.status(200).json({
            teams,
        });
    }
    catch {
        return res.status(500).json({
            message: "Failed to fetch teams",
        });
    }
};
exports.getAllTeams = getAllTeams;
const getOneTeam = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const team = await (0, teamService_1.getTeam)(id);
        return res.status(200).json({
            team,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Team not found";
        return res.status(404).json({
            message,
        });
    }
};
exports.getOneTeam = getOneTeam;
const create = async (req, res) => {
    try {
        const { teamName, contactNumber, } = req.body;
        const team = await (0, teamService_1.addTeam)({
            teamName,
            contactNumber,
        });
        return res.status(201).json({
            message: "Relief team created successfully",
            team,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to create relief team";
        return res.status(400).json({
            message,
        });
    }
};
exports.create = create;
const updateStatus = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { status } = req.body;
        if (status !== "AVAILABLE" &&
            status !== "BUSY" &&
            status !== "OFFLINE") {
            return res.status(400).json({
                message: "Invalid team status",
            });
        }
        const team = await (0, teamService_1.changeTeamStatus)(id, status);
        return res.status(200).json({
            message: "Team status updated successfully",
            team,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to update team status";
        return res.status(400).json({
            message,
        });
    }
};
exports.updateStatus = updateStatus;
