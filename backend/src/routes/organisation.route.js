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
router.get('/:id', protectRoute, getOrganisation);
router.get('/:id/users', protectRoute, getOrganisationUsers);
router.patch('/:id', protectRoute, updateOrganisation);
router.patch('/:id/coworkers', protectRoute, addCoworkers);
router.post('/:id/invite', protectRoute, inviteColleagues);
router.post('/:id/conversation', protectRoute, getOrCreateConversation);
router.post('/join/:joinLink', protectRoute, joinByLink);

export default router;