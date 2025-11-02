import api from '../config/axios';
import type {
  ILaterItem,
  CreateLaterItemData,
  UpdateLaterItemData,
  LaterItemStatus
} from '../types/later';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Get all later items with optional status filter
 */
export const getLaterItems = async (organisationId: string, status?: LaterItemStatus): Promise<ILaterItem[]> => {
  const params = new URLSearchParams({ organisationId });
  if (status) {
    params.append('status', status);
  }
  const response = await api.get<ApiResponse<ILaterItem[]>>(`/later?${params.toString()}`);
  return response.data.data;
};

/**
 * Get a single later item by ID
 */
export const getLaterItem = async (id: string): Promise<ILaterItem> => {
  const response = await api.get<ApiResponse<ILaterItem>>(`/later/${id}`);
  return response.data.data;
};

/**
 * Create a new later item
 */
export const createLaterItem = async (data: CreateLaterItemData): Promise<ILaterItem> => {
  const response = await api.post<ApiResponse<ILaterItem>>('/later', data);
  return response.data.data;
};

/**
 * Update a later item (title, description, dueDate)
 */
export const updateLaterItem = async (
  id: string,
  data: UpdateLaterItemData
): Promise<ILaterItem> => {
  const response = await api.patch<ApiResponse<ILaterItem>>(`/later/${id}`, data);
  return response.data.data;
};

/**
 * Update later item status (move between tabs)
 */
export const updateLaterItemStatus = async (
  id: string,
  status: LaterItemStatus
): Promise<ILaterItem> => {
  const response = await api.patch<ApiResponse<ILaterItem>>(`/later/${id}/status`, { status });
  return response.data.data;
};

/**
 * Delete a later item
 */
export const deleteLaterItem = async (id: string): Promise<void> => {
  await api.delete(`/later/${id}`);
};
