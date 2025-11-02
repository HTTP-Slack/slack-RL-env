import express from 'express';

import { protectRoute } from '../middlewares/protectRoute.js';
import { getThreads } from '../controllers/thread.controller.js';

const router = express.Router();

router.get('/', protectRoute, getThreads);

export default router;