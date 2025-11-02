import express from 'express';

import { protectRoute } from '../middlewares/protectRoute.js';

import {
  getLaterItems,
  getLaterItem,
  createLaterItem,
  updateLaterItem,
  updateLaterItemStatus,
  deleteLaterItem
} from '../controllers/later.controller.js';

const router = express.Router();

// Get all later items (with optional status filter)
router.get('/', protectRoute, getLaterItems);

// Get single later item
router.get('/:id', protectRoute, getLaterItem);

// Create new later item
router.post('/', protectRoute, createLaterItem);

// Update later item (title, description, dueDate)
router.patch('/:id', protectRoute, updateLaterItem);

// Update later item status (move between tabs)
router.patch('/:id/status', protectRoute, updateLaterItemStatus);

// Delete later item
router.delete('/:id', protectRoute, deleteLaterItem);

export default router;
