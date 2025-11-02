import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { Server } from 'socket.io';

import initializeSocket from './config/socket.js';
import connectDB from './config/db.js';
import './config/passport.js';

import authRoute from './routes/auth.route.js';
import messageRoute from './routes/message.route.js';
import organisationRoute from './routes/organisation.route.js';
import channelRoute from './routes/channel.route.js';
import conversationRoute from './routes/conversation.route.js';
import fileRoute from './routes/file.route.js';
import { protectRoute } from './middlewares/protectRoute.js';
import { streamFileByWorkspace } from './controllers/file.controller.js';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PATCH']
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

app.use('/api/auth', authRoute);
app.use('/api/message', messageRoute);
app.use('/api/organisation', organisationRoute);
app.use('/api/channel', channelRoute);
app.use('/api/conversation', conversationRoute);
app.get('/files/:workspaceId/:id/:filename', protectRoute, streamFileByWorkspace);
app.use('/api/files', fileRoute);

server.listen(PORT, ()=> {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
