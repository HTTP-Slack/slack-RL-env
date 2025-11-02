import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updateProfilePicture,
  getProfilePicture,
} from '../controllers/user.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// Public route to get a picture
router.get('/:id/picture', getProfilePicture);

// All routes below are protected
router.use(protectRoute);

router.route('/me')
  .get(getUserProfile)
  .patch(updateUserProfile);

// This route uses the 'upload' middleware to handle 'multipart/form-data'
// It expects the image file under the field name 'profilePicture'
router
  .route('/me/picture')
  .patch(upload.single('profilePicture'), updateProfilePicture);

export default router;