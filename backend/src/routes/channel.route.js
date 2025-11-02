import express from 'express';

import { protectRoute } from '../middlewares/protectRoute.js';
import {
  createChannel,
  getChannelByOrg,
  getChannel,
  addUserToChannel
} from '../controllers/channel.controller.js';

const router = express.Router();

router.post('/', protectRoute, createChannel);
router.get('/org/:id', protectRoute, getChannelByOrg);
router.get('/:id', protectRoute, getChannel);
router.patch('/:id', protectRoute, addUserToChannel);

export default router;