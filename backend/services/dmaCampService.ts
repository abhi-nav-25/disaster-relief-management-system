import {
    updateOfficialCampData,
} from "../repositories/dmaCampRepository";

export const updateCampOfficialData = async (
    campId: number,
    data: {
        officialCode?: string;
        name?: string;
        address?: string;
        latitude?: number;
        longitude?: number;
        capacity?: number;
    }
) => {
    if (!Number.isInteger(campId) || campId <= 0) {
        throw new Error("Invalid camp ID");
    }

    if (data.latitude !== undefined &&
        (data.latitude < -90 || data.latitude > 90)) {
        throw new Error("Invalid latitude");
    }

    if (data.longitude !== undefined &&
        (data.longitude < -180 || data.longitude > 180)) {
        throw new Error("Invalid longitude");
    }

    if (data.capacity !== undefined &&
        (!Number.isInteger(data.capacity) || data.capacity < 0)) {
        throw new Error("Capacity must be a non-negative integer");
    }

    if (
        data.officialCode === undefined &&
        data.name === undefined &&
        data.address === undefined &&
        data.latitude === undefined &&
        data.longitude === undefined &&
        data.capacity === undefined
    ) {
        throw new Error("At least one field is required");
    }

    return updateOfficialCampData(campId, data);
};