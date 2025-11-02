import express from 'express';

import { protectRoute } from '../../middlewares/protectRoute.js';
import {
  getPrivacyVisibilityPreferences,
  updatePrivacyVisibilityPreferences,
  createPrivacyVisibilityPreferences,
  blockInvitation,
  unblockInvitation,
  hidePerson,
  unhidePerson,
} from '../../controllers/preferences/privacyVisibilityPreferences.controller.js';

const router = express.Router();

router.get('/', protectRoute, getPrivacyVisibilityPreferences);
router.post('/', protectRoute, createPrivacyVisibilityPreferences);
router.patch('/', protectRoute, updatePrivacyVisibilityPreferences);
router.post('/blocked-invitations', protectRoute, blockInvitation);
router.delete('/blocked-invitations/:userIdentifier', protectRoute, unblockInvitation);
router.post('/hidden-people', protectRoute, hidePerson);
router.delete('/hidden-people/:userIdentifier', protectRoute, unhidePerson);

export default router;

