import express from 'express';

import { protectRoute } from '../../middlewares/protectRoute.js';
import {
  getLanguageRegionPreferences,
  updateLanguageRegionPreferences,
  createLanguageRegionPreferences,
} from '../../controllers/preferences/languageRegionPreferences.controller.js';

const router = express.Router();

router.get('/', protectRoute, getLanguageRegionPreferences);
router.post('/', protectRoute, createLanguageRegionPreferences);
router.patch('/', protectRoute, updateLanguageRegionPreferences);

export default router;

