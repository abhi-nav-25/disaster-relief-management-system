import api from './api';
import type { Resource } from '../types/models.types';

export interface CreateResourcePayload {
  name: string;
  description?: string;
  unit: string;
}

export interface UpdateResourcePayload {
  name?: string;
  description?: string;
  unit?: string;
  isActive?: boolean;
}

export const resourceService = {
  async getAllResources(): Promise<Resource[]> {
    const response = await api.get<{ resources: Resource[] }>('/resources');
    return response.data.resources;
  },

  async getResourceById(id: number): Promise<Resource> {
    const response = await api.get<{ resource: Resource }>(`/resources/${id}`);
    return response.data.resource;
  },

  async createResource(payload: CreateResourcePayload): Promise<Resource> {
    const response = await api.post<{ message: string; resource: Resource }>(
      '/resources',
      payload
    );
    return response.data.resource;
  },

  async updateResource(id: number, payload: UpdateResourcePayload): Promise<Resource> {
    const response = await api.put<{ message: string; resource: Resource }>(
      `/resources/${id}`,
      payload
    );
    return response.data.resource;
  },
};
