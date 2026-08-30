import { Request, Response } from "express";
import {
    getAllCamps,
    getCampById,
    getNearestCamps,
} from "../services/campService";

export const getCamps = async (
    req: Request,
    res: Response
) => {
    try {
        const camps = await getAllCamps();

        return res.status(200).json({
            camps,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch relief camps",
        });
    }
};

export const getCamp = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                message: "Invalid camp ID",
            });
        }

        const camp = await getCampById(id);

        return res.status(200).json({
            camp,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch relief camp";

        return res.status(404).json({
            message,
        });
    }
};

export const getNearest = async (
    req: Request,
    res: Response
) => {
    try {
        const latitude = Number(req.query.latitude);
        const longitude = Number(req.query.longitude);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            return res.status(400).json({
                message:
                    "Valid latitude and longitude are required",
            });
        }

        const camps = await getNearestCamps(
            latitude,
            longitude
        );

        return res.status(200).json({
            camps,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to find nearby camps";

        return res.status(400).json({
            message,
        });
    }
};