import api from '../config/axios';
import type {
  ListData,
  ListItemData,
  Column,
  ListTemplate,
} from '../types/list';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ========== List CRUD Operations ==========

/**
 * Get all lists for an organisation
 */
export const getLists = async (organisationId: string): Promise<ListData[]> => {
  const response = await api.get<ApiResponse<ListData[]>>(`/list/org/${organisationId}`);
  return response.data.data;
};

/**
 * Get a single list by ID
 */
export const getList = async (id: string): Promise<ListData> => {
  const response = await api.get<ApiResponse<ListData>>(`/list/${id}`);
  return response.data.data;
};

/**
 * Create a new list
 */
export const createList = async (data: {
  title: string;
  description?: string;
  organisationId: string;
  columns?: Column[];
  template?: string;
}): Promise<ListData> => {
  const response = await api.post<ApiResponse<ListData>>('/list', data);
  return response.data.data;
};

/**
 * Update a list
 */
export const updateList = async (
  id: string,
  data: { title?: string; description?: string; columns?: Column[] }
): Promise<ListData> => {
  const response = await api.patch<ApiResponse<ListData>>(`/list/${id}`, data);
  return response.data.data;
};

/**
 * Delete a list
 */
export const deleteList = async (id: string): Promise<void> => {
  await api.delete(`/list/${id}`);
};

/**
 * Add collaborators to a list
 */
export const addCollaborators = async (
  id: string,
  emails: string[]
): Promise<ListData> => {
  const response = await api.patch<ApiResponse<ListData>>(`/list/${id}/collaborators`, {
    emails,
  });
  return response.data.data;
};

// ========== List Item Operations ==========

/**
 * Get all items for a list
 */
export const getListItems = async (listId: string): Promise<ListItemData[]> => {
  const response = await api.get<ApiResponse<ListItemData[]>>(`/list/${listId}/items`);
  return response.data.data;
};

/**
 * Create a new list item
 */
export const createListItem = async (
  listId: string,
  data: { data: { [columnId: string]: any }; order?: number }
): Promise<ListItemData> => {
  const response = await api.post<ApiResponse<ListItemData>>(`/list/${listId}/items`, data);
  return response.data.data;
};

/**
 * Update a list item
 */
export const updateListItem = async (
  listId: string,
  itemId: string,
  data: { data?: { [columnId: string]: any }; order?: number }
): Promise<ListItemData> => {
  const response = await api.patch<ApiResponse<ListItemData>>(
    `/list/${listId}/items/${itemId}`,
    data
  );
  return response.data.data;
};

/**
 * Delete a list item
 */
export const deleteListItem = async (listId: string, itemId: string): Promise<void> => {
  await api.delete(`/list/${listId}/items/${itemId}`);
};

/**
 * Reorder list items
 */
export const reorderItems = async (
  listId: string,
  items: { id: string; order: number }[]
): Promise<void> => {
  await api.patch(`/list/${listId}/items/reorder`, { items });
};

// ========== Template Operations ==========

/**
 * Get all available templates
 */
export const getTemplates = async (): Promise<ListTemplate[]> => {
  const response = await api.get<ApiResponse<ListTemplate[]>>('/list/templates');
  return response.data.data;
};

