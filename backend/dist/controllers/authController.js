"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const authService_1 = require("../services/authService");
const register = async (req, res) => {
    try {
        const { name, email, password, phone, role, managedCampId, } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "Name, email, password and role are required",
            });
        }
        if (![
            "CITIZEN",
            "RELIEF_CAMP_MANAGER",
            "CONTROL_CENTRE_OPERATOR",
            "DMA_SUPERVISOR",
            "RELIEF_TEAM",
        ].includes(role)) {
            return res.status(400).json({
                message: "Invalid user role",
            });
        }
        const user = await (0, authService_1.registerUser)({
            name,
            email,
            password,
            phone,
            role,
            managedCampId,
        });
        return res.status(201).json({
            message: "User registered successfully",
            user,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Registration failed";
        return res.status(400).json({
            message,
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }
        const result = await (0, authService_1.loginUser)(email, password);
        return res.status(200).json({
            message: "Login successful",
            ...result,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Login failed";
        return res.status(401).json({
            message,
        });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const user = await (0, authService_1.getUserById)(userId);
        return res.status(200).json({
            user,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to fetch profile";
        return res.status(404).json({
            message,
        });
    }
};
exports.getProfile = getProfile;
