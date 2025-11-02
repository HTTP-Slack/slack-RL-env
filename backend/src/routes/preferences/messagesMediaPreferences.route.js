import express from 'express';

import { protectRoute } from '../../middlewares/protectRoute.js';
import {
  getMessagesMediaPreferences,
  updateMessagesMediaPreferences,
  createMessagesMediaPreferences,
} from '../../controllers/preferences/messagesMediaPreferences.controller.js';

const router = express.Router();

router.get('/', protectRoute, getMessagesMediaPreferences);
router.post('/', protectRoute, createMessagesMediaPreferences);
router.patch('/', protectRoute, updateMessagesMediaPreferences);

export default router;

