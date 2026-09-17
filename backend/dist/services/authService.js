"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authRepository_1 = require("../repositories/authRepository");
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
}
const registerUser = async (data) => {
    const existingUser = await (0, authRepository_1.findUserByEmail)(data.email);
    if (existingUser) {
        throw new Error("User with this email already exists");
    }
    if (data.role === "RELIEF_CAMP_MANAGER" &&
        !data.managedCampId) {
        throw new Error("Camp Manager must belong to a Relief Camp");
    }
    if (data.role !== "RELIEF_CAMP_MANAGER" &&
        data.managedCampId) {
        throw new Error("Only a Relief Camp Manager can be assigned to a camp");
    }
    const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
    const user = await (0, authRepository_1.createUser)({
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
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const user = await (0, authRepository_1.findUserByEmail)(email);
    if (!user) {
        throw new Error("Invalid email or password");
    }
    const passwordMatches = await bcrypt_1.default.compare(password, user.password);
    if (!passwordMatches) {
        throw new Error("Invalid email or password");
    }
    const token = jsonwebtoken_1.default.sign({
        userId: user.id,
        role: user.role,
    }, JWT_SECRET, {
        expiresIn: "1d",
    });
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
exports.loginUser = loginUser;
const getUserById = async (id) => {
    const user = await (0, authRepository_1.findUserById)(id);
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
        teams: user.teamMemberships.map((membership) => membership.team),
    };
};
exports.getUserById = getUserById;
