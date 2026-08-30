import { Request, Response } from "express";
import { CampOperationalStatus } from "@prisma/client";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import {
    updateOwnCampOperationalInfo,
} from "../services/campManagerService";

export const updateOwnCamp = async (
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

        const {
            currentOccupancy,
            operationalStatus,
            operationalNotes,
        } = req.body;

        if (
            currentOccupancy === undefined &&
            operationalStatus === undefined &&
            operationalNotes === undefined
        ) {
            return res.status(400).json({
                message: "At least one field is required",
            });
        }

        if (
            operationalStatus !== undefined &&
            !Object.values(CampOperationalStatus).includes(
                operationalStatus
            )
        ) {
            return res.status(400).json({
                message: "Invalid operational status",
            });
        }

        if (
            currentOccupancy !== undefined &&
            (!Number.isInteger(currentOccupancy) ||
                currentOccupancy < 0)
        ) {
            return res.status(400).json({
                message:
                    "Current occupancy must be a non-negative integer",
            });
        }

        const camp = await updateOwnCampOperationalInfo(
            userId,
            {
                currentOccupancy,
                operationalStatus,
                operationalNotes,
            }
        );

        return res.status(200).json({
            message:
                "Camp operational information updated successfully",
            camp,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update camp information";

        return res.status(400).json({
            message,
        });
    }
};