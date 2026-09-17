"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.create = exports.getResource = exports.getResources = void 0;
const resourceService_1 = require("../services/resourceService");
const getResources = async (req, res) => {
    try {
        const resources = await (0, resourceService_1.getAllResources)();
        return res.status(200).json({
            resources,
        });
    }
    catch {
        return res.status(500).json({
            message: "Failed to fetch resources",
        });
    }
};
exports.getResources = getResources;
const getResource = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const resource = await (0, resourceService_1.getResourceById)(id);
        return res.status(200).json({
            resource,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to fetch resource";
        return res.status(404).json({
            message,
        });
    }
};
exports.getResource = getResource;
const create = async (req, res) => {
    try {
        const { name, description, unit, } = req.body;
        const resource = await (0, resourceService_1.addResource)({
            name,
            description,
            unit,
        });
        return res.status(201).json({
            message: "Resource created successfully",
            resource,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to create resource";
        return res.status(400).json({
            message,
        });
    }
};
exports.create = create;
const update = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, description, unit, isActive, } = req.body;
        const resource = await (0, resourceService_1.editResource)(id, {
            name,
            description,
            unit,
            isActive,
        });
        return res.status(200).json({
            message: "Resource updated successfully",
            resource,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to update resource";
        return res.status(400).json({
            message,
        });
    }
};
exports.update = update;
