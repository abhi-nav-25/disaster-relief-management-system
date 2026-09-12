import api from './api';
import type { ReliefCamp } from '../types/models.types';

export interface UpdateCampOfficialDataPayload {
  officialCode?: string;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
}

export const dmaCampService = {
  async updateCampOfficialData(
    campId: number,
    data: UpdateCampOfficialDataPayload
  ): Promise<ReliefCamp> {
    const response = await api.put<{ message: string; camp: ReliefCamp }>(
      `/dma/camps/${campId}`,
      data
    );
    return response.data.camp;
  },
};
