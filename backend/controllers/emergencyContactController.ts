import { Request, Response } from "express";
import {
    getAllEmergencyContacts,
} from "../services/emergencyContactService";

export const getEmergencyContacts = async (
    req: Request,
    res: Response
) => {
    try {
        const contacts = await getAllEmergencyContacts();

        return res.status(200).json({
            contacts,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch emergency contacts",
        });
    }
};