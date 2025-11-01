import express from 'express';

import { protectRoute } from '../middlewares/protectRoute.js';

import {
  getConversation,
  getConversationsByOrg
} from '../controllers/conversation.controller.js';

const router = express.Router();

router.get('/org/:id', protectRoute, getConversationsByOrg);
router.get('/:id', protectRoute, getConversation);

export default router;