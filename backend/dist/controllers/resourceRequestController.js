"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePriority = exports.verify = exports.getRequests = exports.getMyCampRequests = exports.getOneRequest = exports.createRequest = exports.createOnBehalfRequest = void 0;
const client_1 = require("@prisma/client");
const resourceRequestService_1 = require("../services/resourceRequestService");
const createOnBehalfRequest = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const { campId, channel, description, priority, items, } = req.body;
        const request = await (0, resourceRequestService_1.createOnBehalfResourceRequest)(userId, {
            campId: Number(campId),
            channel,
            description,
            priority,
            items,
        });
        return res.status(201).json({
            message: `Resource request raised successfully for ${request.camp?.name || "camp"} via ${request.channel}`,
            request,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to create resource request on behalf of camp";
        return res.status(400).json({
            message,
        });
    }
};
exports.createOnBehalfRequest = createOnBehalfRequest;
const createRequest = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const { channel, description, items, } = req.body;
        // Camp Manager requests created through the API
        // must be ONLINE.
        if (channel !== client_1.RequestChannel.ONLINE) {
            return res.status(400).json({
                message: "Camp Manager requests must use the ONLINE channel",
            });
        }
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "At least one resource item is required",
            });
        }
        const request = await (0, resourceRequestService_1.createCampResourceRequest)(userId, {
            channel,
            description,
            items,
        });
        return res.status(201).json({
            message: "Resource request created successfully",
            request,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to create resource request";
        return res.status(400).json({
            message,
        });
    }
};
exports.createRequest = createRequest;
const getOneRequest = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const id = Number(req.params.id);
        const request = await (0, resourceRequestService_1.getRequest)(id, userId);
        return res.status(200).json({
            request,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Resource request not found";
        return res.status(404).json({
            message,
        });
    }
};
exports.getOneRequest = getOneRequest;
const getMyCampRequests = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const requests = await (0, resourceRequestService_1.getCampRequests)(userId);
        return res.status(200).json({
            requests,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to fetch requests";
        return res.status(400).json({
            message,
        });
    }
};
exports.getMyCampRequests = getMyCampRequests;
const getRequests = async (req, res) => {
    try {
        const requests = await (0, resourceRequestService_1.getAllRequests)();
        return res.status(200).json({
            requests,
        });
    }
    catch {
        return res.status(500).json({
            message: "Failed to fetch resource requests",
        });
    }
};
exports.getRequests = getRequests;
const verify = async (req, res) => {
    try {
        const operatorId = req.user?.userId;
        if (!operatorId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const requestId = Number(req.params.id);
        const { verificationStatus } = req.body;
        if (verificationStatus !== "VERIFIED" &&
            verificationStatus !== "REJECTED") {
            return res.status(400).json({
                message: "Verification status must be VERIFIED or REJECTED",
            });
        }
        const request = await (0, resourceRequestService_1.verifyRequest)(requestId, operatorId, verificationStatus);
        return res.status(200).json({
            message: "Resource request verification updated successfully",
            request,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to verify request";
        return res.status(400).json({
            message,
        });
    }
};
exports.verify = verify;
const updatePriority = async (req, res) => {
    try {
        const operatorId = req.user?.userId;
        if (!operatorId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const requestId = Number(req.params.id);
        const { priority } = req.body;
        if (!Object.values(client_1.Priority).includes(priority)) {
            return res.status(400).json({
                message: "Invalid priority",
            });
        }
        const request = await (0, resourceRequestService_1.setRequestPriority)(requestId, priority, operatorId);
        return res.status(200).json({
            message: "Request priority updated successfully",
            request,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to update request priority";
        return res.status(400).json({
            message,
        });
    }
};
exports.updatePriority = updatePriority;
