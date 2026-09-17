"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
}
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication token required",
            });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: "Authentication token required",
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (typeof decoded.userId !== "number" ||
            !Number.isInteger(decoded.userId) ||
            decoded.userId <= 0 ||
            typeof decoded.role !== "string") {
            return res.status(401).json({
                message: "Invalid authentication token",
            });
        }
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };
        next();
    }
    catch {
        return res.status(401).json({
            message: "Invalid or expired authentication token",
        });
    }
};
exports.authenticate = authenticate;
