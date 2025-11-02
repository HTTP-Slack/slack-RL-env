import express from 'express';

import { protectRoute } from '../middlewares/protectRoute.js';
import {
  createChannel,
  getChannelByOrg,
  getChannel,
  addUserToChannel,
  starChannel,
  unstarChannel
} from '../controllers/channel.controller.js';

const router = express.Router();

router.post('/', protectRoute, createChannel);
router.get('/org/:id', protectRoute, getChannelByOrg);
router.get('/:id', protectRoute, getChannel);
router.patch('/:id', protectRoute, addUserToChannel);
router.post('/:id/star', protectRoute, starChannel);
router.post('/:id/unstar', protectRoute, unstarChannel);

export default router;