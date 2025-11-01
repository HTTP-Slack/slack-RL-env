import express from 'express';

import { getMessages, getMessage, createMessage } from '../controllers/message.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';

const router = express.Router();

router.get('/', protectRoute, getMessages);
router.get('/:id', protectRoute, getMessage);
router.post('/', protectRoute, createMessage);

export default router;