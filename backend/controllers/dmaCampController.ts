import { Request, Response } from "express";
import {
    updateCampOfficialData,
} from "../services/dmaCampService";

export const updateOfficialCamp = async (
    req: Request,
    res: Response
) => {
    try {
        const campId = Number(req.params.id);

        if (!Number.isInteger(campId) || campId <= 0) {
            return res.status(400).json({
                message: "Invalid camp ID",
            });
        }

        const {
            officialCode,
            name,
            address,
            latitude,
            longitude,
            capacity,
        } = req.body;

        const camp = await updateCampOfficialData(
            campId,
            {
                officialCode,
                name,
                address,
                latitude,
                longitude,
                capacity,
            }
        );

        return res.status(200).json({
            message: "Official camp information updated successfully",
            camp,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update official camp information";

        return res.status(400).json({
            message,
        });
    }
};