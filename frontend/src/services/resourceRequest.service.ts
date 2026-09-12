import api from './api';
import type {
  ResourceRequest,
  RequestVerificationStatus,
  Priority,
  RequestChannel,
} from '../types/models.types';

export interface CreateResourceRequestPayload {
  channel: RequestChannel;
  description?: string;
  items: {
    resourceId: number;
    quantity: number;
    notes?: string;
  }[];
}

export const resourceRequestService = {
  async getAllRequests(): Promise<ResourceRequest[]> {
    const response = await api.get<{ requests: ResourceRequest[] }>('/resource-requests');
    return response.data.requests;
  },

  async getRequestById(id: number): Promise<ResourceRequest> {
    const response = await api.get<{ request: ResourceRequest }>(`/resource-requests/${id}`);
    return response.data.request;
  },

  async getMyCampRequests(): Promise<ResourceRequest[]> {
    const response = await api.get<{ requests: ResourceRequest[] }>('/resource-requests/my-camp');
    return response.data.requests;
  },

  async createRequest(payload: CreateResourceRequestPayload): Promise<ResourceRequest> {
    const response = await api.post<{ message: string; request: ResourceRequest }>(
      '/resource-requests',
      payload
    );
    return response.data.request;
  },

  async verifyRequest(
    id: number,
    verificationStatus: RequestVerificationStatus
  ): Promise<ResourceRequest> {
    const response = await api.put<{ message: string; request: ResourceRequest }>(
      `/resource-requests/${id}/verify`,
      { verificationStatus }
    );
    return response.data.request;
  },

  async updatePriority(id: number, priority: Priority): Promise<ResourceRequest> {
    const response = await api.put<{ message: string; request: ResourceRequest }>(
      `/resource-requests/${id}/priority`,
      { priority }
    );
    return response.data.request;
  },
};
