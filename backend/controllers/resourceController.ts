import { Request, Response } from "express";
import {
    getAllResources,
    getResourceById,
    addResource,
    editResource,
} from "../services/resourceService";

export const getResources = async (
    req: Request,
    res: Response
) => {
    try {
        const resources = await getAllResources();

        return res.status(200).json({
            resources,
        });
    } catch {
        return res.status(500).json({
            message: "Failed to fetch resources",
        });
    }
};

export const getResource = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        const resource = await getResourceById(id);

        return res.status(200).json({
            resource,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch resource";

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
            name,
            description,
            unit,
        } = req.body;

        const resource = await addResource({
            name,
            description,
            unit,
        });

        return res.status(201).json({
            message: "Resource created successfully",
            resource,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to create resource";

        return res.status(400).json({
            message,
        });
    }
};

export const update = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        const {
            name,
            description,
            unit,
            isActive,
        } = req.body;

        const resource = await editResource(id, {
            name,
            description,
            unit,
            isActive,
        });

        return res.status(200).json({
            message: "Resource updated successfully",
            resource,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update resource";

        return res.status(400).json({
            message,
        });
    }
};