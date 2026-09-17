"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewDuplicateCheck = exports.findDuplicateChecks = exports.createDuplicateCheck = exports.findSimilarRequests = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const findSimilarRequests = async (campId, requestId) => {
    return prisma_1.default.resourceRequest.findMany({
        where: {
            campId,
            id: {
                not: requestId,
            },
            status: {
                in: ["PENDING", "ASSIGNED", "IN_PROGRESS"],
            },
        },
        include: {
            items: {
                include: {
                    resource: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.findSimilarRequests = findSimilarRequests;
const createDuplicateCheck = async (requestId, possibleDuplicateId, reason) => {
    return prisma_1.default.requestDuplicateCheck.create({
        data: {
            originalRequest: {
                connect: {
                    id: requestId,
                },
            },
            possibleDuplicateRequest: {
                connect: {
                    id: possibleDuplicateId,
                },
            },
            reason,
        },
    });
};
exports.createDuplicateCheck = createDuplicateCheck;
const findDuplicateChecks = async (requestId) => {
    return prisma_1.default.requestDuplicateCheck.findMany({
        where: {
            originalRequestId: requestId,
        },
        include: {
            possibleDuplicateRequest: true,
        },
    });
};
exports.findDuplicateChecks = findDuplicateChecks;
const reviewDuplicateCheck = async (checkId, reviewedById, decision) => {
    return prisma_1.default.requestDuplicateCheck.update({
        where: {
            id: checkId,
        },
        data: {
            decision,
            reviewedBy: {
                connect: {
                    id: reviewedById,
                },
            },
            reviewedAt: new Date(),
        },
    });
};
exports.reviewDuplicateCheck = reviewDuplicateCheck;
