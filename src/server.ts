import dotenv from "dotenv";
import http from "http";
import app from "@/app";
import { Server as SocketIOServer } from "socket.io";
import { setupSocket } from "@/socket";
import {broadcastStaffStatus} from "@/socket"

dotenv.config();

const port = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

setupSocket(io);
broadcastStaffStatus(io);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});