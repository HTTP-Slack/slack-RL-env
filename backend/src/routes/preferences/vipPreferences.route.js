import express from 'express';

import { protectRoute } from '../../middlewares/protectRoute.js';
import {
  getVIPPreferences,
  updateVIPPreferences,
  createVIPPreferences,
  addVIP,
  removeVIP,
} from '../../controllers/preferences/vipPreferences.controller.js';

const router = express.Router();

router.get('/', protectRoute, getVIPPreferences);
router.post('/', protectRoute, createVIPPreferences);
router.patch('/', protectRoute, updateVIPPreferences);
router.post('/vip-list', protectRoute, addVIP);
router.delete('/vip-list/:vip', protectRoute, removeVIP);

export default router;

