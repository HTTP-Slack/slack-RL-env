import express from 'express';

import { protectRoute } from '../../middlewares/protectRoute.js';
import {
  getPreferences,
  updatePreferences,
  createPreferences,
} from '../../controllers/preferences/preferences.controller.js';
import notificationPreferencesRoute from './notificationPreferences.route.js';
import vipPreferencesRoute from './vipPreferences.route.js';
import navigationPreferencesRoute from './navigationPreferences.route.js';
import homePreferencesRoute from './homePreferences.route.js';
import appearancePreferencesRoute from './appearancePreferences.route.js';
import themeRoute from './theme.route.js';

const router = express.Router();

// Main preferences routes
router.get('/', protectRoute, getPreferences);
router.post('/', protectRoute, createPreferences);
router.patch('/', protectRoute, updatePreferences);

// Subcategory routes
router.use('/notifications', notificationPreferencesRoute);
router.use('/vip', vipPreferencesRoute);
router.use('/navigation', navigationPreferencesRoute);
router.use('/home', homePreferencesRoute);
router.use('/appearance', appearancePreferencesRoute);
router.use('/themes', themeRoute);

export default router;

