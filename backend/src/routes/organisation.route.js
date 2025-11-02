import express from 'express'

import { protectRoute } from '../middlewares/protectRoute.js';
import {
  getOrganisation,
  createOrganisation,
  updateOrganisation,
  getWorkspaces,
  addCoworkers,
  inviteColleagues,
  joinByLink,
  getOrCreateConversation,
  getOrganisationUsers
} from '../controllers/organisation.controller.js';

const router = express.Router();

router.post('/', protectRoute, createOrganisation);
router.get('/workspaces', protectRoute, getWorkspaces);

// Routes with specific suffixes must come before generic /:id route
router.get('/:id/users', protectRoute, getOrganisationUsers);
router.get('/:id', protectRoute, getOrganisation);

// PATCH and POST routes (different HTTP methods, no conflict with GET)
router.patch('/:id/coworkers', protectRoute, addCoworkers);
router.patch('/:id', protectRoute, updateOrganisation);
router.post('/:id/conversation', protectRoute, getOrCreateConversation);
router.post('/:id/invite', protectRoute, inviteColleagues);
router.post('/join/:joinLink', protectRoute, joinByLink);

export default router;