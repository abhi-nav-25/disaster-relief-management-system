"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateResource = exports.createResource = exports.findResourceById = exports.findAllResources = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const findAllResources = async () => {
    return prisma_1.default.resource.findMany({
        orderBy: {
            name: "asc",
        },
    });
};
exports.findAllResources = findAllResources;
const findResourceById = async (id) => {
    return prisma_1.default.resource.findUnique({
        where: {
            id,
        },
    });
};
exports.findResourceById = findResourceById;
const createResource = async (data) => {
    return prisma_1.default.resource.create({
        data,
    });
};
exports.createResource = createResource;
const updateResource = async (id, data) => {
    return prisma_1.default.resource.update({
        where: {
            id,
        },
        data,
    });
};
exports.updateResource = updateResource;
