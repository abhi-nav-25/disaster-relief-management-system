"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeTeamStatus = exports.addTeam = exports.getTeam = exports.getTeams = void 0;
const teamRepository_1 = require("../repositories/teamRepository");
const getTeams = async () => {
    return (0, teamRepository_1.findAllTeams)();
};
exports.getTeams = getTeams;
const getTeam = async (id) => {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid team ID");
    }
    const team = await (0, teamRepository_1.findTeamById)(id);
    if (!team) {
        throw new Error("Relief team not found");
    }
    return team;
};
exports.getTeam = getTeam;
const addTeam = async (data) => {
    if (!data.teamName?.trim()) {
        throw new Error("Team name is required");
    }
    if (!data.contactNumber?.trim()) {
        throw new Error("Contact number is required");
    }
    return (0, teamRepository_1.createTeam)({
        teamName: data.teamName.trim(),
        contactNumber: data.contactNumber.trim(),
    });
};
exports.addTeam = addTeam;
const changeTeamStatus = async (id, status) => {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid team ID");
    }
    return (0, teamRepository_1.updateTeamStatus)(id, status);
};
exports.changeTeamStatus = changeTeamStatus;
