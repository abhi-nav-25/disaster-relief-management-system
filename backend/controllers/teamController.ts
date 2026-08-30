import { Request, Response } from "express";

import {
    getTeams,
    getTeam,
    addTeam,
    changeTeamStatus,
} from "../services/teamService";

export const getAllTeams = async (
    req: Request,
    res: Response
) => {
    try {
        const teams = await getTeams();

        return res.status(200).json({
            teams,
        });
    } catch {
        return res.status(500).json({
            message: "Failed to fetch teams",
        });
    }
};

export const getOneTeam = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        const team = await getTeam(id);

        return res.status(200).json({
            team,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Team not found";

        return res.status(404).json({
            message,
        });
    }
};

export const create = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            teamName,
            contactNumber,
        } = req.body;

        const team = await addTeam({
            teamName,
            contactNumber,
        });

        return res.status(201).json({
            message: "Relief team created successfully",
            team,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to create relief team";

        return res.status(400).json({
            message,
        });
    }
};

export const updateStatus = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        const { status } = req.body;

        if (
            status !== "AVAILABLE" &&
            status !== "BUSY" &&
            status !== "OFFLINE"
        ) {
            return res.status(400).json({
                message: "Invalid team status",
            });
        }

        const team =
            await changeTeamStatus(
                id,
                status
            );

        return res.status(200).json({
            message: "Team status updated successfully",
            team,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update team status";

        return res.status(400).json({
            message,
        });
    }
};