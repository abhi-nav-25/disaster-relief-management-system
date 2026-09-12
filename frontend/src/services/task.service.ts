import api from './api';
import type { Task, TaskStatus } from '../types/models.types';

export interface CreateTaskPayload {
  teamId: number;
  resourceRequestId: number;
  title: string;
  description?: string;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
}

export const taskService = {
  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const response = await api.post<{ message: string; task: Task }>('/tasks', payload);
    return response.data.task;
  },

  async getTaskById(id: number): Promise<Task> {
    const response = await api.get<{ task: Task }>(`/tasks/${id}`);
    return response.data.task;
  },

  async getMyTeamTasks(): Promise<Task[]> {
    const response = await api.get<{ tasks: Task[] }>('/tasks/my-team');
    return response.data.tasks;
  },

  async updateTaskStatus(id: number, status: TaskStatus, outcome?: string): Promise<Task> {
    const response = await api.put<{ message: string; task: Task }>(`/tasks/${id}/status`, {
      status,
      outcome,
    });
    return response.data.task;
  },
};
