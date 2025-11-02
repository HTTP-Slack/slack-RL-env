import express from 'express';
import { unifiedSearch } from '../controllers/search.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';

const router = express.Router();

// GET /api/search?query=test&organisation=123&channelId=456&limit=20
router.get('/', protectRoute, unifiedSearch);

export default router;
