import api from './api';
import type { ReliefTeam, ResourceRequestAssignment } from '../types/models.types';

export const assignmentService = {
  async getAvailableTeams(): Promise<ReliefTeam[]> {
    const response = await api.get<{ teams: ReliefTeam[] }>(
      '/request-assignments/available-teams'
    );
    return response.data.teams;
  },

  async assignTeam(
    requestId: number,
    teamId: number,
    notes?: string
  ): Promise<ResourceRequestAssignment> {
    const response = await api.post<{
      message: string;
      assignment: ResourceRequestAssignment;
    }>(`/request-assignments/request/${requestId}/team/${teamId}`, { notes });
    return response.data.assignment;
  },

  async getAssignments(requestId: number): Promise<ResourceRequestAssignment[]> {
    const response = await api.get<{ assignments: ResourceRequestAssignment[] }>(
      `/request-assignments/request/${requestId}`
    );
    return response.data.assignments;
  },
};
