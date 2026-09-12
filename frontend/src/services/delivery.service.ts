import api from './api';
import type { ResourceDelivery, DeliveryStatus } from '../types/models.types';

export interface CreateDeliveryPayload {
  requestId: number;
  teamId: number;
  notes?: string;
  items: {
    resourceId: number;
    quantity: number;
  }[];
}

export const deliveryService = {
  async createDelivery(payload: CreateDeliveryPayload): Promise<ResourceDelivery> {
    const response = await api.post<{ message: string; delivery: ResourceDelivery }>(
      '/deliveries',
      payload
    );
    return response.data.delivery;
  },

  async getDeliveryById(id: number): Promise<ResourceDelivery> {
    const response = await api.get<{ delivery: ResourceDelivery }>(`/deliveries/${id}`);
    return response.data.delivery;
  },

  async getDeliveriesForRequest(requestId: number): Promise<ResourceDelivery[]> {
    const response = await api.get<{ deliveries: ResourceDelivery[] }>(
      `/deliveries/request/${requestId}`
    );
    return response.data.deliveries;
  },

  async updateDeliveryStatus(
    id: number,
    status: DeliveryStatus
  ): Promise<ResourceDelivery> {
    const response = await api.put<{ message: string; delivery: ResourceDelivery }>(
      `/deliveries/${id}/status`,
      { status }
    );
    return response.data.delivery;
  },
};
