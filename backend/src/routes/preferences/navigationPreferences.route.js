import express from 'express';

import { protectRoute } from '../../middlewares/protectRoute.js';
import {
  getNavigationPreferences,
  updateNavigationPreferences,
  createNavigationPreferences,
} from '../../controllers/preferences/navigationPreferences.controller.js';

const router = express.Router();

router.get('/', protectRoute, getNavigationPreferences);
router.post('/', protectRoute, createNavigationPreferences);
router.patch('/', protectRoute, updateNavigationPreferences);

export default router;

