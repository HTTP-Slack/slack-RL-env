import express from 'express';

import { protectRoute } from '../../middlewares/protectRoute.js';
import {
  getAudioVideoPreferences,
  updateAudioVideoPreferences,
  createAudioVideoPreferences,
} from '../../controllers/preferences/audioVideoPreferences.controller.js';

const router = express.Router();

router.get('/', protectRoute, getAudioVideoPreferences);
router.post('/', protectRoute, createAudioVideoPreferences);
router.patch('/', protectRoute, updateAudioVideoPreferences);

export default router;

