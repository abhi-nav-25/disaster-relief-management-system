"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllEmergencyContacts = void 0;
const emergencyContactRepository_1 = require("../repositories/emergencyContactRepository");
const getAllEmergencyContacts = async () => {
    return (0, emergencyContactRepository_1.findAllEmergencyContacts)();
};
exports.getAllEmergencyContacts = getAllEmergencyContacts;
