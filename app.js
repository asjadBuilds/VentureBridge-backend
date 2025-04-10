import express from "express";
import dotenv from "dotenv"
import mongoDb from "./db/index.js";
import cors from "cors"
import router from "./routes/index.js";
import twilio from "twilio"
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { Server } from 'socket.io';
import http from 'http';
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const connectedUsers = new Map();
app.use(express.json())
app.use(bodyParser.json())
app.use(cors({
  origin:'http://localhost:5173',
  credentials:true
}));
app.use(cookieParser())

dotenv.config();
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
mongoDb()

app.listen(process.env.PORT, ()=>{
    console.log(`Server is running at ${process.env.PORT}`)
})

app.use('/api',router);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Save userId with socketId
  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
  });

  // Handle private messages
  socket.on('sendMessage', ({ senderId, receiverId, message }) => {
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', {
        senderId,
        message
      });
      
    }
  });

  // Clean up
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (let [userId, sockId] of connectedUsers) {
      if (sockId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

export {app, twilioClient};