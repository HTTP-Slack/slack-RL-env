import api from '../config/axios';
import type { Notification, NotificationResponse, UnreadCountResponse } from '../types/notification';

/**
 * Notification API service
 */

/**
 * Get all notifications for the current user
 * @route GET /api/notifications
 * @access Private
 * @param organisation - Optional organisation ID to filter by
 * @param isRead - Optional filter by read status
 * @param limit - Optional limit for pagination (default: 50)
 * @param skip - Optional skip for pagination (default: 0)
 */
export const getNotifications = async (
  organisation?: string,
  isRead?: boolean,
  limit = 50,
  skip = 0
): Promise<NotificationResponse> => {
  const params = new URLSearchParams();
  if (organisation) params.append('organisation', organisation);
  if (isRead !== undefined) params.append('isRead', isRead.toString());
  params.append('limit', limit.toString());
  params.append('skip', skip.toString());

  const response = await api.get<NotificationResponse>(
    `/notifications?${params.toString()}`
  );
  return response.data;
};

/**
 * Get unread notification count
 * @route GET /api/notifications/unread-count
 * @access Private
 * @param organisation - Optional organisation ID to filter by
 */
export const getUnreadCount = async (
  organisation?: string
): Promise<number> => {
  const params = new URLSearchParams();
  if (organisation) params.append('organisation', organisation);

  const response = await api.get<UnreadCountResponse>(
    `/notifications/unread-count?${params.toString()}`
  );
  return response.data.count;
};

/**
 * Mark a notification as read
 * @route PATCH /api/notifications/:id/read
 * @access Private
 * @param notificationId - Notification ID
 */
export const markAsRead = async (
  notificationId: string
): Promise<Notification> => {
  const response = await api.patch<{ success: boolean; data: Notification }>(
    `/notifications/${notificationId}/read`
  );
  return response.data.data;
};

/**
 * Mark all notifications as read
 * @route PATCH /api/notifications/read-all
 * @access Private
 * @param organisation - Optional organisation ID to filter by
 */
export const markAllAsRead = async (
  organisation?: string
): Promise<{ message: string; count: number }> => {
  const params = new URLSearchParams();
  if (organisation) params.append('organisation', organisation);

  const response = await api.patch<{
    success: boolean;
    message: string;
    count: number;
  }>(`/notifications/read-all?${params.toString()}`);
  return {
    message: response.data.message,
    count: response.data.count,
  };
};

/**
 * Delete a notification
 * @route DELETE /api/notifications/:id
 * @access Private
 * @param notificationId - Notification ID
 */
export const deleteNotification = async (
  notificationId: string
): Promise<void> => {
  await api.delete(`/notifications/${notificationId}`);
};

/**
 * Delete all notifications
 * @route DELETE /api/notifications
 * @access Private
 * @param organisation - Optional organisation ID to filter by
 * @param isRead - Optional filter by read status
 */
export const deleteAllNotifications = async (
  organisation?: string,
  isRead?: boolean
): Promise<number> => {
  const params = new URLSearchParams();
  if (organisation) params.append('organisation', organisation);
  if (isRead !== undefined) params.append('isRead', isRead.toString());

  const response = await api.delete<{
    success: boolean;
    message: string;
    count: number;
  }>(`/notifications?${params.toString()}`);
  return response.data.count;
};

