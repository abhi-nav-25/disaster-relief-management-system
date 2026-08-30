import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
    findUserByEmail,
    findUserById,
    createUser,
} from "../repositories/authRepository";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
}

type UserRole =
    | "CITIZEN"
    | "RELIEF_CAMP_MANAGER"
    | "CONTROL_CENTRE_OPERATOR"
    | "DMA_SUPERVISOR"
    | "RELIEF_TEAM";

export const registerUser = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: UserRole;
    managedCampId?: number;
}) => {
    const existingUser = await findUserByEmail(data.email);

    if (existingUser) {
        throw new Error("User with this email already exists");
    }

    if (
        data.role === "RELIEF_CAMP_MANAGER" &&
        !data.managedCampId
    ) {
        throw new Error(
            "Camp Manager must belong to a Relief Camp"
        );
    }

    if (
        data.role !== "RELIEF_CAMP_MANAGER" &&
        data.managedCampId
    ) {
        throw new Error(
            "Only a Relief Camp Manager can be assigned to a camp"
        );
    }

    const hashedPassword = await bcrypt.hash(
        data.password,
        10
    );

    const user = await createUser({
        ...data,
        password: hashedPassword,
    });

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        managedCampId: user.managedCampId,
    };
};

export const loginUser = async (
    email: string,
    password: string
) => {
    const user = await findUserByEmail(email);

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatches) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        {
            userId: user.id,
            role: user.role,
        },
        JWT_SECRET,
        {
            expiresIn: "1d",
        }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            managedCampId: user.managedCampId,
        },
    };
};

export const getUserById = async (id: number) => {
    const user = await findUserById(id);

    if (!user) {
        throw new Error("User not found");
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        managedCampId: user.managedCampId,
        managedCamp: user.managedCamp,
        teams: user.teamMemberships.map(
            (membership) => membership.team
        ),
    };
};