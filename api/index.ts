import { createServer } from "http";
import { Server, type Socket } from "socket.io";
import express from "express";
import "dotenv/config";
import { authMiddleware } from "./middlewares/auth";
import { userHandler } from "./handlers/userHandler";
import { chatHandler } from "./handlers/chatHandler";

const origins = (process.env.ORIGIN ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: origins } });

// Crear servidor HTTP
const port = Number(process.env.PORT) || 3000;

// Crear instancia de Socket.IO adjuntada al servidor HTTP
// Middleware
io.use(authMiddleware);

io.on("connection", (socket: Socket) => {
    console.log("A user connected with id: ", socket.id);

    // Handlers
    userHandler(io, socket);
    chatHandler(io, socket);

    // Opcional: manejar desconexión
    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id);
    });
});

httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
