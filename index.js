const Message = require('./models/Message');
require('dotenv').config();
const express = require('express');
const http = require('http');           // Required to create raw HTTP server
const { Server } = require('socket.io'); // Destructure Server class from socket.io

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server from express app
const server = http.createServer(app);

// Create WebSocket server with CORS enabled (optional config)
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins for testing (tighten for prod)
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());

// Basic HTTP route
app.get('/', (req, res) => {
  res.send('Chat App Backend is running with WebSocket!');
});


// Authentication - check if the token sent by the user is correct or not

const jwt = require('jsonwebtoken');
// require() imports the jsonwebtoken library which is crucial for verifying JWTs

io.use((socket, next) => {
  // io.use() function registers a middleware that runs for every new socket connection attempt

  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // attach user data to socket
    next();
  } catch (err) {
    return next(new Error("Invalid token"));
  }
});


// if the user token is authenticated then run the connection

// WebSocket connection handling

// line 59 runs when a new user connects through websocket
io.on('connection', (socket) => {
  console.log(`${socket.user.id} connected`);

  // line 63 listens for a 'chat message' event sent by the user (eg: when someone type a message and hit send)
  socket.on('chat message', async (msg) => {
    try {
      const senderId = socket.user.id; // gets the sender's user ID from the authenticated socket

      // line 68 creates a new message object to save in the mongoDB
      const newMessage = new Message({
        sender: senderId,
        text: msg
      });

      await newMessage.save();

      // Broadcast message to all connected clients
      io.emit('chat message', {
        senderId,
        text: msg,
        timestamp: newMessage.timestamp
      });
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // when a user disconnects this runs
  socket.on('disconnect', () => {
    console.log(`${socket.user.id} disconnected`);
  });
});


// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


// connects mongoDB
const connectDB = require('./config/db');
connectDB();

// imports routes file
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);