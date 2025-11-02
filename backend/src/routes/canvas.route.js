import express from 'express';

import { protectRoute } from '../middlewares/protectRoute.js';
import {
  createCanvas,
  getCanvasesByOrg,
  getCanvas,
  updateCanvas,
  deleteCanvas,
  addUserToCanvas,
  updateLastViewed,
  starCanvas,
} from '../controllers/canvas.controller.js';

const router = express.Router();

// Canvas routes - exact matches and specific patterns first
router.post('/', protectRoute, createCanvas);

// Organization-specific route (literal "org" prefix)
router.get('/org/:id', protectRoute, getCanvasesByOrg);

// Routes with specific suffixes before generic /:id
router.patch('/:id/view', protectRoute, updateLastViewed);
router.patch('/:id/star', protectRoute, starCanvas);
router.patch('/:id/collaborators', protectRoute, addUserToCanvas);

// Generic routes (come last)
router.get('/:id', protectRoute, getCanvas);
router.patch('/:id', protectRoute, updateCanvas);
router.delete('/:id', protectRoute, deleteCanvas);

export default router;

