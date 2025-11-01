import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy - only initialize if credentials are provided
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (googleClientId && googleClientSecret && 
    googleClientId !== 'your-google-client-id-here' && 
    googleClientSecret !== 'your-google-client-secret-here') {
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('📧 Google OAuth profile:', profile.emails[0].value);

          // Check if user already exists
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // User exists, update Google ID if not set
            if (!user.googleId) {
              user.googleId = profile.id;
              user.profilePicture = profile.photos[0]?.value || user.profilePicture;
              await user.save();
            }
            console.log('✅ Existing user signed in:', user.email);
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            username: profile.displayName || profile.emails[0].value.split('@')[0],
            email: profile.emails[0].value,
            googleId: profile.id,
            profilePicture: profile.photos[0]?.value,
            password: Math.random().toString(36).slice(-8), // Random password (won't be used)
          });

          console.log('✅ New user created via Google:', user.email);
          done(null, user);
        } catch (error) {
          console.error('❌ Google OAuth error:', error);
          done(error, null);
        }
      }
    )
  );
  console.log('✅ Google OAuth strategy initialized');
} else {
  console.log('⚠️  Google OAuth not configured - please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env');
}

export default passport;
