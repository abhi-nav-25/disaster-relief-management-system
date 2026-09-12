import api from './api';
import type { ReliefCamp, CampOperationalStatus } from '../types/models.types';

export interface UpdateCampStatusPayload {
  currentOccupancy?: number;
  operationalStatus?: CampOperationalStatus;
  operationalNotes?: string;
}

export const campManagerService = {
  async updateCampStatus(payload: UpdateCampStatusPayload): Promise<ReliefCamp> {
    const response = await api.put<{ message: string; camp: ReliefCamp }>(
      '/camp-manager/me',
      payload
    );
    return response.data.camp;
  },
};
