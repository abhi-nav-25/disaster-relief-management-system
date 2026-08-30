import {
    findAllTeams,
    findTeamById,
    createTeam,
    updateTeamStatus,
} from "../repositories/teamRepository";

export const getTeams = async () => {
    return findAllTeams();
};

export const getTeam = async (id: number) => {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid team ID");
    }

    const team = await findTeamById(id);

    if (!team) {
        throw new Error("Relief team not found");
    }

    return team;
};

export const addTeam = async (data: {
    teamName: string;
    contactNumber: string;
}) => {
    if (!data.teamName?.trim()) {
        throw new Error("Team name is required");
    }

    if (!data.contactNumber?.trim()) {
        throw new Error("Contact number is required");
    }

    return createTeam({
        teamName: data.teamName.trim(),
        contactNumber: data.contactNumber.trim(),
    });
};

export const changeTeamStatus = async (
    id: number,
    status: "AVAILABLE" | "BUSY" | "OFFLINE"
) => {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid team ID");
    }

    return updateTeamStatus(id, status);
};