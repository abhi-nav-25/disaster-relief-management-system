"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogs = exports.logAction = void 0;
const auditLogRepository_1 = require("../repositories/auditLogRepository");
const logAction = async (data) => {
    return (0, auditLogRepository_1.createAuditLog)(data);
};
exports.logAction = logAction;
const getLogs = async (entityType, entityId) => {
    if (entityId !== undefined &&
        (!Number.isInteger(entityId) || entityId <= 0)) {
        throw new Error("Invalid entity ID");
    }
    return (0, auditLogRepository_1.findAuditLogs)(entityType, entityId);
};
exports.getLogs = getLogs;
