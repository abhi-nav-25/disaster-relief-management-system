"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatus = exports.getForRequest = exports.getOne = exports.create = void 0;
const client_1 = require("@prisma/client");
const deliveryService_1 = require("../services/deliveryService");
const create = async (req, res) => {
    try {
        const operatorId = req.user?.userId;
        if (!operatorId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const { requestId, teamId, notes, items, } = req.body;
        if (!Number.isInteger(Number(requestId)) ||
            Number(requestId) <= 0) {
            return res.status(400).json({
                message: "Invalid request ID",
            });
        }
        if (!Number.isInteger(Number(teamId)) ||
            Number(teamId) <= 0) {
            return res.status(400).json({
                message: "Invalid team ID",
            });
        }
        const delivery = await (0, deliveryService_1.createResourceDelivery)(operatorId, {
            requestId: Number(requestId),
            teamId: Number(teamId),
            notes,
            items,
        });
        return res.status(201).json({
            message: "Resource delivery created successfully",
            delivery,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to create resource delivery";
        return res.status(400).json({
            message,
        });
    }
};
exports.create = create;
const getOne = async (req, res) => {
    try {
        const deliveryId = Number(req.params.id);
        const delivery = await (0, deliveryService_1.getDelivery)(deliveryId);
        return res.status(200).json({
            delivery,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Delivery not found";
        return res.status(404).json({
            message,
        });
    }
};
exports.getOne = getOne;
const getForRequest = async (req, res) => {
    try {
        const requestId = Number(req.params.requestId);
        const deliveries = await (0, deliveryService_1.getRequestDeliveries)(requestId);
        return res.status(200).json({
            deliveries,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to fetch deliveries";
        return res.status(400).json({
            message,
        });
    }
};
exports.getForRequest = getForRequest;
const updateStatus = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const deliveryId = Number(req.params.id);
        const { status } = req.body;
        if (!Object.values(client_1.DeliveryStatus).includes(status)) {
            return res.status(400).json({
                message: "Invalid delivery status",
            });
        }
        const delivery = await (0, deliveryService_1.changeDeliveryStatus)(userId, deliveryId, status);
        return res.status(200).json({
            message: "Delivery status updated successfully",
            delivery,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to update delivery status";
        return res.status(400).json({
            message,
        });
    }
};
exports.updateStatus = updateStatus;
