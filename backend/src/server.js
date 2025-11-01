import express from 'express';
import dotenv from 'dotenv';
import xss from 'xss-clean';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

import initializeSocket from './config/socket.js';
import connectDB from './config/db.js';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(xss());
app.use(cors());

initializeSocket(io);

server.listen(PORT, ()=> {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});