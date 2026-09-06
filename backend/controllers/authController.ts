import { Request, Response } from "express";
import {
    registerUser,
    loginUser,
    getUserById,
} from "../services/authService";

export const register = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            role,
            managedCampId,
        } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message:
                    "Name, email, password and role are required",
            });
        }
        if (
            ![
                "CITIZEN",
                "RELIEF_CAMP_MANAGER",
                "CONTROL_CENTRE_OPERATOR",
                "DMA_SUPERVISOR",
                "RELIEF_TEAM",
            ].includes(role)
        ) {
            return res.status(400).json({
                message: "Invalid user role",
            });
        }
        const user = await registerUser({
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
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Registration failed";

        return res.status(400).json({
            message,
        });
    }
};

export const login = async (
    req: Request,
    res: Response
) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const result = await loginUser(
            email,
            password
        );

        return res.status(200).json({
            message: "Login successful",
            ...result,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Login failed";

        return res.status(401).json({
            message,
        });
    }
};

export const getProfile = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const user = await getUserById(userId);

        return res.status(200).json({
            user,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch profile";

        return res.status(404).json({
            message,
        });
    }
};