"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNearestCamps = exports.getCampById = exports.getAllCamps = void 0;
const campRepository_1 = require("../repositories/campRepository");
const getAllCamps = async () => {
    return (0, campRepository_1.findAllCamps)();
};
exports.getAllCamps = getAllCamps;
const getCampById = async (id) => {
    const camp = await (0, campRepository_1.findCampById)(id);
    if (!camp) {
        throw new Error("Relief camp not found");
    }
    return camp;
};
exports.getCampById = getCampById;
const getNearestCamps = async (latitude, longitude) => {
    if (latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180) {
        throw new Error("Invalid latitude or longitude");
    }
    return (0, campRepository_1.findNearestCamps)(latitude, longitude);
};
exports.getNearestCamps = getNearestCamps;
