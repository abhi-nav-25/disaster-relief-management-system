"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCampOfficialData = void 0;
const dmaCampRepository_1 = require("../repositories/dmaCampRepository");
const updateCampOfficialData = async (campId, data) => {
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
    if (data.officialCode === undefined &&
        data.name === undefined &&
        data.address === undefined &&
        data.latitude === undefined &&
        data.longitude === undefined &&
        data.capacity === undefined) {
        throw new Error("At least one field is required");
    }
    return (0, dmaCampRepository_1.updateOfficialCampData)(campId, data);
};
exports.updateCampOfficialData = updateCampOfficialData;
