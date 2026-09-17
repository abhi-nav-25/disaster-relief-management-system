"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.findUserById = exports.findUserByEmail = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const findUserByEmail = async (email) => {
    return prisma_1.default.user.findUnique({
        where: {
            email,
        },
    });
};
exports.findUserByEmail = findUserByEmail;
const findUserById = async (id) => {
    return prisma_1.default.user.findUnique({
        where: {
            id,
        },
        include: {
            managedCamp: true,
            teamMemberships: {
                include: {
                    team: true,
                },
            },
        },
    });
};
exports.findUserById = findUserById;
const createUser = async (data) => {
    return prisma_1.default.user.create({
        data,
    });
};
exports.createUser = createUser;
