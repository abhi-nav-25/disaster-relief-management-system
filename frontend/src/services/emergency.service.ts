import api from './api';
import type { EmergencyContact } from '../types/models.types';

export const emergencyService = {
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    const response = await api.get<{ contacts: EmergencyContact[] }>('/emergency-contacts');
    return response.data.contacts;
  },
};
