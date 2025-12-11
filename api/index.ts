import { createServer } from "http";
import { Server, type Socket } from "socket.io";
import express, {Request, Response} from "express";
import "dotenv/config";
import { authMiddleware } from "./middlewares/auth";
import { userHandler } from "./handlers/userHandler";
import { chatHandler } from "./handlers/chatHandler";
import { getHistoryByRoomId } from "./services/chatService";

const origins = (process.env.ORIGIN ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: origins } });

// ⭐️ MIDDLEWARES NECESARIOS PARA MANEJAR PETICIONES HTTP
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// NUEVO ENDPOINT HTTP REST
// Este es el endpoint que el meeting-service llamará: GET /api/history/:meetingId
app.get("/api/history/:meetingId", async (req: Request, res: Response) => {
    const meetingId = req.params.meetingId;

    if (!meetingId) {
        return res.status(400).json({ success: false, message: "Falta el meetingId" });
    }

    try {
        const chatHistory = await getHistoryByRoomId(meetingId); // ⬅️ Llamada a Firestore
        
        return res.status(200).json({ 
            success: true, 
            meetingId,
            chatHistory: chatHistory 
        });

    } catch (error) {
        console.error("Error al obtener historial de chat:", error);
        return res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
});

// Crear servidor HTTP
const port = Number(process.env.PORT) || 3002;

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
