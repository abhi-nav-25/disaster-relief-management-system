import {
    findAllResources,
    findResourceById,
    createResource,
    updateResource,
} from "../repositories/resourceRepository";

export const getAllResources = async () => {
    return findAllResources();
};

export const getResourceById = async (id: number) => {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid resource ID");
    }

    const resource = await findResourceById(id);

    if (!resource) {
        throw new Error("Resource not found");
    }

    return resource;
};

export const addResource = async (data: {
    name: string;
    description?: string;
    unit: string;
}) => {
    if (!data.name?.trim()) {
        throw new Error("Resource name is required");
    }

    if (!data.unit?.trim()) {
        throw new Error("Resource unit is required");
    }

    return createResource({
        name: data.name.trim(),
        description: data.description?.trim(),
        unit: data.unit.trim(),
    });
};

export const editResource = async (
    id: number,
    data: {
        name?: string;
        description?: string;
        unit?: string;
        isActive?: boolean;
    }
) => {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid resource ID");
    }

    return updateResource(id, data);
};