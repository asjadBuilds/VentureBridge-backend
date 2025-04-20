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
import { socketManager } from "./socketManager.js";
const app = express();
dotenv.config();
const server = http.createServer(app);
const io = new Server(server,{
  cors: {
    origin: `${process.env.CLIENT_URL}`,
    credentials: true,
  },
});
app.use(express.json())
app.use(bodyParser.json())
app.use(cors({
  origin:`${process.env.CLIENT_URL}`,
  credentials:true
}));
app.use((req,res,next)=>{
  req.io=io;
  next()
})
app.use(cookieParser())

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
mongoDb()
socketManager(io)

server.listen(process.env.PORT, ()=>{
    console.log(`Server is running at ${process.env.PORT}`)
})

app.use('/api',router);



export {app, twilioClient};