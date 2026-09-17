"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllEmergencyContacts = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const findAllEmergencyContacts = async () => {
    return prisma_1.default.emergencyContact.findMany({
        orderBy: {
            name: "asc",
        },
    });
};
exports.findAllEmergencyContacts = findAllEmergencyContacts;
