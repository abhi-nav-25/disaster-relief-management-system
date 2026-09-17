"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRequestPriority = exports.verifyResourceRequest = exports.findAllResourceRequests = exports.findRequestsByCamp = exports.findRequestById = exports.createResourceRequest = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createResourceRequest = async (data) => {
    return prisma_1.default.resourceRequest.create({
        data: {
            campId: data.campId,
            createdById: data.createdById,
            channel: data.channel,
            description: data.description,
            priority: data.priority,
            items: {
                create: data.items.map((item) => ({
                    resourceId: item.resourceId,
                    quantity: item.quantity,
                    notes: item.notes,
                })),
            },
        },
        include: {
            items: {
                include: {
                    resource: true,
                },
            },
            camp: true,
        },
    });
};
exports.createResourceRequest = createResourceRequest;
const findRequestById = async (id) => {
    return prisma_1.default.resourceRequest.findUnique({
        where: {
            id,
        },
        include: {
            camp: true,
            items: {
                include: {
                    resource: true,
                },
            },
            assignments: {
                include: {
                    team: true,
                    assignedBy: true,
                },
            },
        },
    });
};
exports.findRequestById = findRequestById;
const findRequestsByCamp = async (campId) => {
    return prisma_1.default.resourceRequest.findMany({
        where: {
            campId,
        },
        include: {
            items: {
                include: {
                    resource: true,
                },
            },
            assignments: {
                include: {
                    team: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.findRequestsByCamp = findRequestsByCamp;
const findAllResourceRequests = async () => {
    return prisma_1.default.resourceRequest.findMany({
        include: {
            camp: true,
            items: {
                include: {
                    resource: true,
                },
            },
            assignments: {
                include: {
                    team: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.findAllResourceRequests = findAllResourceRequests;
const verifyResourceRequest = async (id, verifiedById, verificationStatus) => {
    return prisma_1.default.resourceRequest.update({
        where: {
            id,
        },
        data: {
            verificationStatus,
            verifiedById,
            verifiedAt: new Date(),
        },
    });
};
exports.verifyResourceRequest = verifyResourceRequest;
const updateRequestPriority = async (id, priority) => {
    return prisma_1.default.resourceRequest.update({
        where: {
            id,
        },
        data: {
            priority,
        },
    });
};
exports.updateRequestPriority = updateRequestPriority;
