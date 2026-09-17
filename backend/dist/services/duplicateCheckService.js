"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decideDuplicate = exports.getDuplicateChecks = exports.detectPossibleDuplicates = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const auditLogService_1 = require("./auditLogService");
const duplicateCheckRepository_1 = require("../repositories/duplicateCheckRepository");
const detectPossibleDuplicates = async (requestId) => {
    const request = await prisma_1.default.resourceRequest.findUnique({
        where: {
            id: requestId,
        },
        include: {
            items: true,
        },
    });
    if (!request) {
        throw new Error("Resource request not found");
    }
    const existingRequests = await (0, duplicateCheckRepository_1.findSimilarRequests)(request.campId, requestId);
    const possibleDuplicates = [];
    for (const existing of existingRequests) {
        const requestedResourceIds = new Set(request.items.map((item) => item.resourceId));
        const matchingItems = existing.items.filter((item) => requestedResourceIds.has(item.resourceId));
        if (matchingItems.length === 0) {
            continue;
        }
        const totalRequested = request.items.length;
        const matchingCount = matchingItems.length;
        const matchRatio = matchingCount / totalRequested;
        if (matchRatio >= 0.5) {
            const reason = `Possible duplicate: ${matchingCount} ` +
                `of ${totalRequested} requested resources ` +
                `overlap with request #${existing.id}.`;
            const duplicateCheck = await (0, duplicateCheckRepository_1.createDuplicateCheck)(requestId, existing.id, reason);
            possibleDuplicates.push(duplicateCheck);
        }
    }
    return possibleDuplicates;
};
exports.detectPossibleDuplicates = detectPossibleDuplicates;
const getDuplicateChecks = async (requestId) => {
    return (0, duplicateCheckRepository_1.findDuplicateChecks)(requestId);
};
exports.getDuplicateChecks = getDuplicateChecks;
const decideDuplicate = async (checkId, operatorId, decision) => {
    const operator = await prisma_1.default.user.findUnique({
        where: {
            id: operatorId,
        },
        select: {
            role: true,
        },
    });
    if (!operator) {
        throw new Error("User not found");
    }
    if (operator.role !==
        "CONTROL_CENTRE_OPERATOR") {
        throw new Error("Only a Control Centre Operator can review duplicates");
    }
    const check = await prisma_1.default.requestDuplicateCheck.findUnique({
        where: {
            id: checkId,
        },
    });
    if (!check) {
        throw new Error("Duplicate check not found");
    }
    if (check.decision !== "PENDING") {
        throw new Error("Duplicate check has already been reviewed");
    }
    const updatedCheck = await (0, duplicateCheckRepository_1.reviewDuplicateCheck)(checkId, operatorId, decision);
    await (0, auditLogService_1.logAction)({
        action: "DUPLICATE_DECISION",
        entityType: "RequestDuplicateCheck",
        entityId: checkId,
        performedById: operatorId,
        afterData: {
            decision,
        },
        description: `Duplicate decision recorded as ${decision}`,
    });
    return updatedCheck;
};
exports.decideDuplicate = decideDuplicate;
