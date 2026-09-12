import api from './api';
import type { RequestDuplicateCheck, DuplicateDecision } from '../types/models.types';

export const duplicateCheckService = {
  async detectDuplicates(requestId: number): Promise<RequestDuplicateCheck[]> {
    const response = await api.post<{
      message: string;
      possibleDuplicates: RequestDuplicateCheck[];
    }>(`/duplicate-checks/request/${requestId}/detect`);
    return response.data.possibleDuplicates;
  },

  async getChecksForRequest(requestId: number): Promise<RequestDuplicateCheck[]> {
    const response = await api.get<{ checks: RequestDuplicateCheck[] }>(
      `/duplicate-checks/request/${requestId}`
    );
    return response.data.checks;
  },

  async reviewCheck(
    checkId: number,
    decision: DuplicateDecision
  ): Promise<RequestDuplicateCheck> {
    const response = await api.put<{
      message: string;
      check: RequestDuplicateCheck;
    }>(`/duplicate-checks/${checkId}/review`, { decision });
    return response.data.check;
  },
};
