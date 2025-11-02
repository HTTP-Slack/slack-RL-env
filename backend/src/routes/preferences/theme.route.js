import express from 'express';

import { protectRoute } from '../../middlewares/protectRoute.js';
import {
  getThemes,
  getTheme,
  createTheme,
  updateTheme,
  deleteTheme,
} from '../../controllers/preferences/theme.controller.js';

const router = express.Router();

router.get('/', protectRoute, getThemes);
router.get('/:id', protectRoute, getTheme);
router.post('/', protectRoute, createTheme);
router.patch('/:id', protectRoute, updateTheme);
router.delete('/:id', protectRoute, deleteTheme);

export default router;

