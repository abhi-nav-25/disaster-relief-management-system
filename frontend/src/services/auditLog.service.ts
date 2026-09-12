import api from './api';
import type { AuditLog } from '../types/models.types';

export const auditLogService = {
  async getAuditLogs(params?: {
    entityType?: string;
    entityId?: number;
  }): Promise<AuditLog[]> {
    const response = await api.get<{ logs: AuditLog[] }>('/audit-logs', { params });
    return response.data.logs;
  },
};
