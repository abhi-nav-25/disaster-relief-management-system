"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOfficialCamp = void 0;
const dmaCampService_1 = require("../services/dmaCampService");
const updateOfficialCamp = async (req, res) => {
    try {
        const campId = Number(req.params.id);
        if (!Number.isInteger(campId) || campId <= 0) {
            return res.status(400).json({
                message: "Invalid camp ID",
            });
        }
        const { officialCode, name, address, latitude, longitude, capacity, } = req.body;
        const camp = await (0, dmaCampService_1.updateCampOfficialData)(campId, {
            officialCode,
            name,
            address,
            latitude,
            longitude,
            capacity,
        });
        return res.status(200).json({
            message: "Official camp information updated successfully",
            camp,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to update official camp information";
        return res.status(400).json({
            message,
        });
    }
};
exports.updateOfficialCamp = updateOfficialCamp;
