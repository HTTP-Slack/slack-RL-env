import express from 'express'

import { protectRoute } from '../middlewares/protectRoute.js';
import {
  getOrganisation,
  createOrganisation,
  updateOrganisation,
  getWorkspaces,
  addCoworkers
} from '../controllers/organisation.controller.js';

const router = express.Router();

router.post('/', protectRoute, createOrganisation);
router.get('/workspaces', protectRoute, getWorkspaces);
router.get('/:id', protectRoute, getOrganisation);
router.patch('/:id', protectRoute, updateOrganisation);
router.patch('/:id/coworkers', protectRoute, addCoworkers);

export default router;