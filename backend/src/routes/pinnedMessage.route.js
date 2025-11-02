import express from 'express';
import {
  pinMessage,
  unpinMessage,
  getPinnedMessages,
  checkIfPinned,
} from '../controllers/pinnedMessage.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';

const router = express.Router();

router.post('/', protectRoute, pinMessage);
router.delete('/:messageId', protectRoute, unpinMessage);
router.get('/', protectRoute, getPinnedMessages);
router.get('/:messageId/check', protectRoute, checkIfPinned);

export default router;
