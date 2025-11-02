import express from 'express';

import { protectRoute } from '../../middlewares/protectRoute.js';
import {
  getHomePreferences,
  updateHomePreferences,
  createHomePreferences,
} from '../../controllers/preferences/homePreferences.controller.js';

const router = express.Router();

router.get('/', protectRoute, getHomePreferences);
router.post('/', protectRoute, createHomePreferences);
router.patch('/', protectRoute, updateHomePreferences);

export default router;

