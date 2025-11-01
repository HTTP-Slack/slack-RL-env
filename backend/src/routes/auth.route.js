import express from 'express';
import passport from 'passport';
import { register, signin, googleCallback } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/signin', signin);

// Google OAuth routes - only register if Google strategy is configured
const isGoogleConfigured = process.env.GOOGLE_CLIENT_ID && 
                           process.env.GOOGLE_CLIENT_SECRET &&
                           process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id-here' &&
                           process.env.GOOGLE_CLIENT_SECRET !== 'your-google-client-secret-here';

if (isGoogleConfigured) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/signin' }),
    googleCallback
  );
} else {
  // Fallback routes when Google OAuth is not configured
  router.get('/google', (req, res) => {
    res.status(503).json({ 
      success: false, 
      message: 'Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env file.' 
    });
  });
  router.get('/google/callback', (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/signin?error=oauth_not_configured`);
  });
}

export default router;