import api from './api';
import type { ReliefTeam, TeamStatus } from '../types/models.types';

export const teamService = {
  async getAllTeams(): Promise<ReliefTeam[]> {
    const response = await api.get<{ teams: ReliefTeam[] }>('/teams');
    return response.data.teams;
  },

  async getTeamById(id: number): Promise<ReliefTeam> {
    const response = await api.get<{ team: ReliefTeam }>(`/teams/${id}`);
    return response.data.team;
  },

  async updateTeamStatus(id: number, status: TeamStatus): Promise<ReliefTeam> {
    const response = await api.put<{ message: string; team: ReliefTeam }>(
      `/teams/${id}/status`,
      { status }
    );
    return response.data.team;
  },

  async createTeam(data: { teamName: string; contactNumber: string }): Promise<ReliefTeam> {
    const response = await api.post<{ message: string; team: ReliefTeam }>('/teams', data);
    return response.data.team;
  },
};
