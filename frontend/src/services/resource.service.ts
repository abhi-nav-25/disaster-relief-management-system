import api from './api';
import type { Resource } from '../types/models.types';

export const resourceService = {
  async getAllResources(): Promise<Resource[]> {
    const response = await api.get<{ resources: Resource[] }>('/resources');
    return response.data.resources;
  },

  async getResourceById(id: number): Promise<Resource> {
    const response = await api.get<{ resource: Resource }>(`/resources/${id}`);
    return response.data.resource;
  },
};
