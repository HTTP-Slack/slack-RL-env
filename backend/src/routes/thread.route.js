import express from 'express';

import { protectRoute } from '../middlewares/protectRoute';
import { getThreads } from '../controllers/thread.controller';

const router = express.Router();

router.get('/', protectRoute, getThreads);

export default router;