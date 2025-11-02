import express from 'express';

import { protectRoute } from '../../middlewares/protectRoute.js';
import {
  getAdvancedPreferences,
  updateAdvancedPreferences,
  createAdvancedPreferences,
} from '../../controllers/preferences/advancedPreferences.controller.js';

const router = express.Router();

router.get('/', protectRoute, getAdvancedPreferences);
router.post('/', protectRoute, createAdvancedPreferences);
router.patch('/', protectRoute, updateAdvancedPreferences);

export default router;

