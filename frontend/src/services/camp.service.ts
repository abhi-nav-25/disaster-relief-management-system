import api from './api';
import type { ReliefCamp } from '../types/models.types';

export const campService = {
  async getAllCamps(): Promise<ReliefCamp[]> {
    const response = await api.get<{ camps: ReliefCamp[] }>('/camps');
    return response.data.camps;
  },

  async getNearestCamps(latitude: number, longitude: number): Promise<ReliefCamp[]> {
    const response = await api.get<{ camps: ReliefCamp[] }>('/camps/nearest', {
      params: { latitude, longitude },
    });
    return response.data.camps;
  },

  async getCampById(id: number): Promise<ReliefCamp> {
    const response = await api.get<{ camp: ReliefCamp }>(`/camps/${id}`);
    return response.data.camp;
  },
};
