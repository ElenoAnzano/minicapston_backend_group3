import dotenv from "dotenv";
import http from "http";
import app from "./app";
import { Server as SocketIOServer } from "socket.io";
import { setupSocket } from "./socket";
import {broadcastStaffStatus} from "./socket"
import cors from "cors";

dotenv.config();

const port = process.env.PORT ? Number(process.env.PORT) : 5000;
const server = http.createServer(app);

app.use(
  cors({
    origin: "https://eventmanagement-taupe.vercel.app",
    credentials: true,
  })
);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.NODE_ENV === "production"
        ? ["https://eventmanagement-taupe.vercel.app"]
        : "http://localhost:5173",
    credentials: true,
  },
});

setupSocket(io);
broadcastStaffStatus(io);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);

});




