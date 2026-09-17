"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNearest = exports.getCamp = exports.getCamps = void 0;
const campService_1 = require("../services/campService");
const getCamps = async (req, res) => {
    try {
        const camps = await (0, campService_1.getAllCamps)();
        return res.status(200).json({
            camps,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch relief camps",
        });
    }
};
exports.getCamps = getCamps;
const getCamp = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                message: "Invalid camp ID",
            });
        }
        const camp = await (0, campService_1.getCampById)(id);
        return res.status(200).json({
            camp,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to fetch relief camp";
        return res.status(404).json({
            message,
        });
    }
};
exports.getCamp = getCamp;
const getNearest = async (req, res) => {
    try {
        const latitude = Number(req.query.latitude);
        const longitude = Number(req.query.longitude);
        if (!Number.isFinite(latitude) ||
            !Number.isFinite(longitude)) {
            return res.status(400).json({
                message: "Valid latitude and longitude are required",
            });
        }
        const camps = await (0, campService_1.getNearestCamps)(latitude, longitude);
        return res.status(200).json({
            camps,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to find nearby camps";
        return res.status(400).json({
            message,
        });
    }
};
exports.getNearest = getNearest;
