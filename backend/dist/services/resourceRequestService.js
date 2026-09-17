"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRequestPriority = exports.verifyRequest = exports.getAllRequests = exports.getCampRequests = exports.getRequest = exports.createCampResourceRequest = exports.createOnBehalfResourceRequest = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
const auditLogService_1 = require("./auditLogService");
const resourceRequestRepository_1 = require("../repositories/resourceRequestRepository");
const createOnBehalfResourceRequest = async (operatorId, data) => {
    const operator = await prisma_1.default.user.findUnique({
        where: {
            id: operatorId,
        },
        select: {
            role: true,
            name: true,
        },
    });
    if (!operator) {
        throw new Error("User not found");
    }
    if (operator.role !== "CONTROL_CENTRE_OPERATOR") {
        throw new Error("Only a Control Centre Operator can create a request on behalf of a camp");
    }
    if (!data.campId || !Number.isInteger(data.campId) || data.campId <= 0) {
        throw new Error("Valid camp ID is required");
    }
    const camp = await prisma_1.default.reliefCamp.findUnique({
        where: {
            id: data.campId,
        },
        select: {
            id: true,
            name: true,
            officialCode: true,
        },
    });
    if (!camp) {
        throw new Error(`Relief camp with ID ${data.campId} not found`);
    }
    if (data.channel !== client_1.RequestChannel.PHONE &&
        data.channel !== client_1.RequestChannel.SMS) {
        throw new Error("Channel must be either PHONE or SMS for requests created on behalf of a camp");
    }
    if (!data.description ||
        typeof data.description !== "string" ||
        data.description.trim().length === 0) {
        throw new Error("Request description is required");
    }
    const trimmedDescription = data.description.trim();
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        throw new Error("At least one resource item is required");
    }
    const resourceIds = data.items.map((item) => item.resourceId);
    if (new Set(resourceIds).size !== resourceIds.length) {
        throw new Error("A resource can only appear once in a request");
    }
    for (const item of data.items) {
        if (!Number.isInteger(item.resourceId) || item.resourceId <= 0) {
            throw new Error("Invalid resource ID");
        }
        if (typeof item.quantity !== "number" ||
            !Number.isFinite(item.quantity) ||
            item.quantity <= 0) {
            throw new Error("Resource quantity must be greater than zero");
        }
        const resource = await prisma_1.default.resource.findUnique({
            where: {
                id: item.resourceId,
            },
            select: {
                id: true,
                isActive: true,
            },
        });
        if (!resource) {
            throw new Error(`Resource ${item.resourceId} not found`);
        }
        if (!resource.isActive) {
            throw new Error(`Resource ${item.resourceId} is inactive`);
        }
    }
    const request = await (0, resourceRequestRepository_1.createResourceRequest)({
        campId: camp.id,
        createdById: operatorId,
        channel: data.channel,
        description: trimmedDescription,
        priority: data.priority || client_1.Priority.MEDIUM,
        items: data.items.map((item) => ({
            resourceId: item.resourceId,
            quantity: item.quantity,
            notes: item.notes?.trim() || undefined,
        })),
    });
    try {
        await (0, auditLogService_1.logAction)({
            action: client_1.AuditAction.CREATE,
            entityType: "ResourceRequest",
            entityId: request.id,
            performedById: operatorId,
            afterData: {
                campId: camp.id,
                campName: camp.name,
                channel: data.channel,
                description: trimmedDescription,
                itemCount: data.items.length,
            },
            description: `Resource request created on behalf of ${camp.name} via ${data.channel}.`,
        });
    }
    catch (auditError) {
        console.error("Failed to write audit log for on-behalf request:", auditError);
    }
    return request;
};
exports.createOnBehalfResourceRequest = createOnBehalfResourceRequest;
const createCampResourceRequest = async (userId, data) => {
    const user = await prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            role: true,
            managedCampId: true,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role !== "RELIEF_CAMP_MANAGER") {
        throw new Error("Only a Relief Camp Manager can create a resource request");
    }
    if (!user.managedCampId) {
        throw new Error("Relief Camp Manager is not assigned to a camp");
    }
    if (data.channel !== "ONLINE") {
        throw new Error("Camp Managers can create only online requests");
    }
    if (!data.items || data.items.length === 0) {
        throw new Error("At least one resource is required");
    }
    const resourceIds = data.items.map((item) => item.resourceId);
    if (new Set(resourceIds).size !==
        resourceIds.length) {
        throw new Error("A resource can only appear once in a request");
    }
    for (const item of data.items) {
        if (!Number.isInteger(item.resourceId) ||
            item.resourceId <= 0) {
            throw new Error("Invalid resource ID");
        }
        if (!Number.isFinite(item.quantity) ||
            item.quantity <= 0) {
            throw new Error("Resource quantity must be greater than zero");
        }
        const resource = await prisma_1.default.resource.findUnique({
            where: {
                id: item.resourceId,
            },
            select: {
                isActive: true,
            },
        });
        if (!resource) {
            throw new Error(`Resource ${item.resourceId} not found`);
        }
        if (!resource.isActive) {
            throw new Error(`Resource ${item.resourceId} is inactive`);
        }
    }
    return (0, resourceRequestRepository_1.createResourceRequest)({
        campId: user.managedCampId,
        createdById: userId,
        channel: data.channel,
        description: data.description,
        priority: data.priority,
        items: data.items,
    });
};
exports.createCampResourceRequest = createCampResourceRequest;
const getRequest = async (id, userId) => {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid request ID");
    }
    const request = await (0, resourceRequestRepository_1.findRequestById)(id);
    if (!request) {
        throw new Error("Resource request not found");
    }
    const user = await prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            role: true,
            managedCampId: true,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role === "CONTROL_CENTRE_OPERATOR") {
        return request;
    }
    if (user.role === "RELIEF_CAMP_MANAGER") {
        if (!user.managedCampId) {
            throw new Error("Relief Camp Manager is not assigned to a camp");
        }
        if (request.campId !==
            user.managedCampId) {
            throw new Error("You do not have permission to view this request");
        }
        return request;
    }
    throw new Error("You do not have permission to view this request");
};
exports.getRequest = getRequest;
const getCampRequests = async (userId) => {
    const user = await prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            role: true,
            managedCampId: true,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role !== "RELIEF_CAMP_MANAGER") {
        throw new Error("Only a Relief Camp Manager can access this endpoint");
    }
    if (!user.managedCampId) {
        throw new Error("Relief Camp Manager is not assigned to a camp");
    }
    return (0, resourceRequestRepository_1.findRequestsByCamp)(user.managedCampId);
};
exports.getCampRequests = getCampRequests;
const getAllRequests = async () => {
    return (0, resourceRequestRepository_1.findAllResourceRequests)();
};
exports.getAllRequests = getAllRequests;
const verifyRequest = async (requestId, operatorId, verificationStatus) => {
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
    if (operator.role !== "CONTROL_CENTRE_OPERATOR") {
        throw new Error("Only a Control Centre Operator can verify requests");
    }
    const request = await (0, resourceRequestRepository_1.findRequestById)(requestId);
    if (!request) {
        throw new Error("Resource request not found");
    }
    if (request.verificationStatus !== "PENDING") {
        throw new Error("Request has already been reviewed");
    }
    const updatedRequest = await (0, resourceRequestRepository_1.verifyResourceRequest)(requestId, operatorId, verificationStatus);
    await (0, auditLogService_1.logAction)({
        action: verificationStatus === "VERIFIED"
            ? "VERIFY"
            : "REJECT",
        entityType: "ResourceRequest",
        entityId: requestId,
        performedById: operatorId,
        beforeData: {
            verificationStatus: request.verificationStatus,
        },
        afterData: {
            verificationStatus: updatedRequest.verificationStatus,
        },
        description: `Resource request ${verificationStatus.toLowerCase()} by Control Centre Operator`,
    });
    return updatedRequest;
};
exports.verifyRequest = verifyRequest;
const setRequestPriority = async (requestId, priority, operatorId) => {
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
    if (operator.role !== "CONTROL_CENTRE_OPERATOR") {
        throw new Error("Only a Control Centre Operator can set priority");
    }
    const request = await (0, resourceRequestRepository_1.findRequestById)(requestId);
    if (!request) {
        throw new Error("Resource request not found");
    }
    if (request.status === "FULFILLED" ||
        request.status === "CANCELLED") {
        throw new Error("Cannot change priority of a completed or cancelled request");
    }
    return (0, resourceRequestRepository_1.updateRequestPriority)(requestId, priority);
};
exports.setRequestPriority = setRequestPriority;
