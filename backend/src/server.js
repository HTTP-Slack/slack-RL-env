//npm imports
import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { Server } from 'socket.io';

//config imports
import initializeSocket from './config/socket.js';
import connectDB from './config/db.js';
import './config/passport.js';

//Route imports
import authRoute from './routes/auth.route.js';
import messageRoute from './routes/message.route.js';
import organisationRoute from './routes/organisation.route.js';
import channelRoute from './routes/channel.route.js';
import conversationRoute from './routes/conversation.route.js';
import teammatesRoute from './routes/teammates.route.js';
import threadRoute from './routes/thread.route.js';
import userRoute from './routes/user.route.js';
import fileRoute from './routes/file.route.js';
import sectionRoute from './routes/section.route.js';
import listRoute from './routes/list.route.js';
import canvasRoute from './routes/canvas.route.js';
import preferencesRoute from './routes/preferences/preferences.route.js';
import pinnedMessageRoute from './routes/pinnedMessage.route.js';

//setup
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});
const PORT = process.env.PORT || 8080;

// CORS configuration
app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

//middleware
app.use(express.json());
app.use(cookieParser());

// Session configuration for passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

initializeSocket(io);

//routes
app.use('/api/auth', authRoute);
app.use('/api/message', messageRoute);
app.use('/api/organisation', organisationRoute);
app.use('/api/channel', channelRoute);
app.use('/api/conversation', conversationRoute);
app.use('/api/threads', threadRoute);
app.use('/api/sections', sectionRoute);
app.use('/api/list', listRoute);
app.use('/api/canvas', canvasRoute);
app.use('/api/teammates', teammatesRoute);
app.use('/api/users', userRoute);
app.use('/api/files', fileRoute);
app.use('/api/preferences', preferencesRoute);
app.use('/api/pinned-messages', pinnedMessageRoute);

server.listen(PORT, ()=> {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
