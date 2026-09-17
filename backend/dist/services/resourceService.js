"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editResource = exports.addResource = exports.getResourceById = exports.getAllResources = void 0;
const resourceRepository_1 = require("../repositories/resourceRepository");
const getAllResources = async () => {
    return (0, resourceRepository_1.findAllResources)();
};
exports.getAllResources = getAllResources;
const getResourceById = async (id) => {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid resource ID");
    }
    const resource = await (0, resourceRepository_1.findResourceById)(id);
    if (!resource) {
        throw new Error("Resource not found");
    }
    return resource;
};
exports.getResourceById = getResourceById;
const addResource = async (data) => {
    if (!data.name?.trim()) {
        throw new Error("Resource name is required");
    }
    if (!data.unit?.trim()) {
        throw new Error("Resource unit is required");
    }
    return (0, resourceRepository_1.createResource)({
        name: data.name.trim(),
        description: data.description?.trim(),
        unit: data.unit.trim(),
    });
};
exports.addResource = addResource;
const editResource = async (id, data) => {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid resource ID");
    }
    return (0, resourceRepository_1.updateResource)(id, data);
};
exports.editResource = editResource;
