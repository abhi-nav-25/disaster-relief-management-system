"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOwnCampOperationalInfo = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const campManagerRepository_1 = require("../repositories/campManagerRepository");
const updateOwnCampOperationalInfo = async (userId, data) => {
    const user = await prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            managedCampId: true,
            role: true,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role !== "RELIEF_CAMP_MANAGER") {
        throw new Error("Only a Relief Camp Manager can update camp operations");
    }
    if (!user.managedCampId) {
        throw new Error("Relief Camp Manager is not assigned to a camp");
    }
    if (data.currentOccupancy !== undefined &&
        data.currentOccupancy < 0) {
        throw new Error("Current occupancy cannot be negative");
    }
    return (0, campManagerRepository_1.updateCampOperationalInfo)(user.managedCampId, data);
};
exports.updateOwnCampOperationalInfo = updateOwnCampOperationalInfo;
