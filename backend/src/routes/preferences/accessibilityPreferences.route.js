import express from 'express';

import { protectRoute } from '../../middlewares/protectRoute.js';
import {
  getAccessibilityPreferences,
  updateAccessibilityPreferences,
  createAccessibilityPreferences,
} from '../../controllers/preferences/accessibilityPreferences.controller.js';

const router = express.Router();

router.get('/', protectRoute, getAccessibilityPreferences);
router.post('/', protectRoute, createAccessibilityPreferences);
router.patch('/', protectRoute, updateAccessibilityPreferences);

export default router;

