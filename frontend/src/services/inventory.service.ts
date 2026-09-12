import api from './api';
import type { CampInventory, InventoryTransactionType } from '../types/models.types';

export interface UpdateInventoryPayload {
  quantity: number;
  transactionType: InventoryTransactionType;
  notes?: string;
}

export const inventoryService = {
  async getMyCampInventory(): Promise<CampInventory[]> {
    const response = await api.get<{ inventory: CampInventory[] }>('/inventory/my-camp');
    return response.data.inventory;
  },

  async updateInventory(
    resourceId: number,
    payload: UpdateInventoryPayload
  ): Promise<CampInventory> {
    const response = await api.put<{ message: string; inventory: CampInventory }>(
      `/inventory/my-camp/${resourceId}`,
      payload
    );
    return response.data.inventory;
  },
};
