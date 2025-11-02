import express from 'express';

import { protectRoute } from '../../middlewares/protectRoute.js';
import {
  getAppearancePreferences,
  updateAppearancePreferences,
  createAppearancePreferences,
} from '../../controllers/preferences/appearancePreferences.controller.js';

const router = express.Router();

router.get('/', protectRoute, getAppearancePreferences);
router.post('/', protectRoute, createAppearancePreferences);
router.patch('/', protectRoute, updateAppearancePreferences);

export default router;

