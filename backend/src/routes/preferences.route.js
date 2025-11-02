import express from 'express';

import { protectRoute } from '../middlewares/protectRoute.js';
import {
  getPreferences,
  updatePreferences,
  createPreferences,
} from '../controllers/preferences.controller.js';

const router = express.Router();

router.get('/', protectRoute, getPreferences);
router.post('/', protectRoute, createPreferences);
router.patch('/', protectRoute, updatePreferences);

export default router;
