import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

import {
    getAvailableTeams,
    assignRequestToTeam,
    getAssignments,
} from "../services/requestAssignmentService";

export const getTeams = async (
    req: Request,
    res: Response
) => {
    try {
        const teams = await getAvailableTeams();

        return res.status(200).json({
            teams,
        });
    } catch {
        return res.status(500).json({
            message: "Failed to fetch available teams",
        });
    }
};

export const assignTeam = async (
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

        const requestId = Number(req.params.requestId);
        const teamId = Number(req.params.teamId);

        if (
            !Number.isInteger(requestId) ||
            requestId <= 0 ||
            !Number.isInteger(teamId) ||
            teamId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid request or team ID",
            });
        }

        const { notes } = req.body;

        const assignment =
            await assignRequestToTeam(
                requestId,
                teamId,
                operatorId,
                notes
            );

        return res.status(201).json({
            message: "Relief team assigned successfully",
            assignment,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to assign relief team";

        return res.status(400).json({
            message,
        });
    }
};

export const getRequestAssignments = async (
    req: Request,
    res: Response
) => {
    try {
        const requestId = Number(req.params.requestId);

        if (
            !Number.isInteger(requestId) ||
            requestId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid request ID",
            });
        }

        const assignments =
            await getAssignments(requestId);

        return res.status(200).json({
            assignments,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch assignments";

        return res.status(400).json({
            message,
        });
    }
};