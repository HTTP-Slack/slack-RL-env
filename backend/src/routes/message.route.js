import express from 'express';

import { getMessages, getMessage, createMessage, getThreadReplies } from '../controllers/message.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';

const router = express.Router();

router.get('/', protectRoute, getMessages);
router.get('/:id/replies', protectRoute, getThreadReplies);
router.get('/:id', protectRoute, getMessage);
router.post('/', protectRoute, createMessage);

export default router;