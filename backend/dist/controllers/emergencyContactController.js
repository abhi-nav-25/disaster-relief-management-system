"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmergencyContacts = void 0;
const emergencyContactService_1 = require("../services/emergencyContactService");
const getEmergencyContacts = async (req, res) => {
    try {
        const contacts = await (0, emergencyContactService_1.getAllEmergencyContacts)();
        return res.status(200).json({
            contacts,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch emergency contacts",
        });
    }
};
exports.getEmergencyContacts = getEmergencyContacts;
