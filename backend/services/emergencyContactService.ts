import {
    findAllEmergencyContacts,
} from "../repositories/emergencyContactRepository";

export const getAllEmergencyContacts = async () => {
    return findAllEmergencyContacts();
};