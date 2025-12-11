import { createServer } from "http";
import { Server, type Socket } from "socket.io";
import express, {Request, Response} from "express";
import "dotenv/config";
import { authMiddleware } from "./middlewares/auth";
import { userHandler } from "./handlers/userHandler";
import { chatHandler } from "./handlers/chatHandler";

const origins = (process.env.ORIGIN ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

console.log(`[DEBUG CORS] Orígenes permitidos:`, origins);

const app = express();
const httpServer = createServer(app);

// Se pasa el httpServer como primer argumento, y luego el objeto de configuración.
const io = new Server(httpServer, { cors: { origin: "*" } }); 

// MIDDLEWARES NECESARIOS PARA MANEJAR PETICIONES HTTP
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Crear servidor HTTP
const port = Number(process.env.PORT) || 3002;

// Middleware de Socket.IO
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