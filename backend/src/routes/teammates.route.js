import express from 'express';

import { protectRoute } from '../middlewares/protectRoute.js';
import { createTeammates, getTeammate } from '../controllers/teammates.controller.js';

const router = express.Router();

router.post('/', protectRoute, createTeammates);
router.get('/:id', protectRoute, getTeammate);

export default router;