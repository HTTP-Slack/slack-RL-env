import express from 'express';

import { protectRoute } from '../middlewares/protectRoute.js';
import {
  createList,
  getListsByOrg,
  getList,
  updateList,
  deleteList,
  addUserToList,
  createListItem,
  getListItems,
  updateListItem,
  deleteListItem,
  reorderItems,
  getTemplates,
} from '../controllers/list.controller.js';

const router = express.Router();

// List routes - exact matches and specific patterns first
router.post('/', protectRoute, createList);

// Template route
router.get('/templates', protectRoute, getTemplates);

// List item routes (must come before /org/:id and /:id to avoid route conflicts)
// These match patterns like /anything/items, so they must come before parameterized routes
router.post('/:listId/items', protectRoute, createListItem);
router.get('/:listId/items', protectRoute, getListItems);
router.patch('/:listId/items/reorder', protectRoute, reorderItems);
router.patch('/:listId/items/:itemId', protectRoute, updateListItem);
router.delete('/:listId/items/:itemId', protectRoute, deleteListItem);

// Organization-specific route (literal "org" prefix - more specific than generic /:id)
router.get('/org/:id', protectRoute, getListsByOrg);

// List routes with specific suffixes before generic /:id
router.patch('/:id/collaborators', protectRoute, addUserToList);
router.get('/:id', protectRoute, getList);
router.patch('/:id', protectRoute, updateList);
router.delete('/:id', protectRoute, deleteList);

export default router;

