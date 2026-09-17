"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOfficialCampData = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const updateOfficialCampData = async (campId, data) => {
    return prisma_1.default.reliefCamp.update({
        where: {
            id: campId,
        },
        data,
    });
};
exports.updateOfficialCampData = updateOfficialCampData;
