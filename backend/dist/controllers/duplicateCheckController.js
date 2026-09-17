"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewDuplicate = exports.getChecks = exports.detectDuplicates = void 0;
const client_1 = require("@prisma/client");
const duplicateCheckService_1 = require("../services/duplicateCheckService");
const detectDuplicates = async (req, res) => {
    try {
        const requestId = Number(req.params.id);
        if (!Number.isInteger(requestId) || requestId <= 0) {
            return res.status(400).json({
                message: "Invalid request ID",
            });
        }
        const checks = await (0, duplicateCheckService_1.detectPossibleDuplicates)(requestId);
        return res.status(200).json({
            message: "Duplicate detection completed",
            possibleDuplicates: checks,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to detect duplicates";
        return res.status(400).json({
            message,
        });
    }
};
exports.detectDuplicates = detectDuplicates;
const getChecks = async (req, res) => {
    try {
        const requestId = Number(req.params.id);
        if (!Number.isInteger(requestId) || requestId <= 0) {
            return res.status(400).json({
                message: "Invalid request ID",
            });
        }
        const checks = await (0, duplicateCheckService_1.getDuplicateChecks)(requestId);
        return res.status(200).json({
            checks,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to fetch duplicate checks";
        return res.status(400).json({
            message,
        });
    }
};
exports.getChecks = getChecks;
const reviewDuplicate = async (req, res) => {
    try {
        const operatorId = req.user?.userId;
        if (!operatorId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const checkId = Number(req.params.id);
        if (!Number.isInteger(checkId) || checkId <= 0) {
            return res.status(400).json({
                message: "Invalid duplicate check ID",
            });
        }
        const { decision } = req.body;
        if (!Object.values(client_1.DuplicateDecision).includes(decision)) {
            return res.status(400).json({
                message: "Invalid duplicate decision",
            });
        }
        const check = await (0, duplicateCheckService_1.decideDuplicate)(checkId, operatorId, decision);
        return res.status(200).json({
            message: "Duplicate decision recorded successfully",
            check,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to review duplicate";
        return res.status(400).json({
            message,
        });
    }
};
exports.reviewDuplicate = reviewDuplicate;
