import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from '../controllers/notification.controller.js';
import protectRoute from '../middlewares/protectRoute.js';

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Get all notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark all notifications as read
router.patch('/read-all', markAllAsRead);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Delete a notification
router.delete('/:id', deleteNotification);

// Delete all notifications
router.delete('/', deleteAllNotifications);

export default router;

