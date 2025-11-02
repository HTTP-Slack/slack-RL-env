import express from 'express';

import { protectRoute } from '../../middlewares/protectRoute.js';
import {
  getMarkAsReadPreferences,
  updateMarkAsReadPreferences,
  createMarkAsReadPreferences,
} from '../../controllers/preferences/markAsReadPreferences.controller.js';

const router = express.Router();

router.get('/', protectRoute, getMarkAsReadPreferences);
router.post('/', protectRoute, createMarkAsReadPreferences);
router.patch('/', protectRoute, updateMarkAsReadPreferences);

export default router;

