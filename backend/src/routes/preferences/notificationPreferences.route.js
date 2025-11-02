import express from 'express';

import { protectRoute } from '../../middlewares/protectRoute.js';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  createNotificationPreferences,
} from '../../controllers/preferences/notificationPreferences.controller.js';

const router = express.Router();

router.get('/', protectRoute, getNotificationPreferences);
router.post('/', protectRoute, createNotificationPreferences);
router.patch('/', protectRoute, updateNotificationPreferences);

export default router;

