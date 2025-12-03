import { Server, Socket } from "socket.io";
import { onlineUsers } from "./userHandler";

type ChatMessagePayload = {
    userId: string;
    message: string;
    timestamp?: string;
    name?: string;
    roomId: string;
};

export const chatHandler = (io: Server, socket: Socket) => {
    const chatMessage = (payload: ChatMessagePayload) => {
        const trimmedMessage = payload?.message?.trim();
        if (!trimmedMessage || !payload.roomId) return;

        const sender =
            onlineUsers.find((user) => user.socketId === socket.id) ?? null;

        const outgoingMessage = {
            userId: payload.userId || sender?.userId || socket.id,
            name: sender?.name || payload.name || "Unknown",
            message: trimmedMessage,
            timestamp: payload.timestamp ?? new Date().toISOString(),
            roomId: payload.roomId,
        };

        io.to(payload.roomId).emit("chat:message", outgoingMessage);

        console.log(
            `Message in room ${payload.roomId} from ${outgoingMessage.name}: ${outgoingMessage.message}`
        );
    };

    socket.on("chat:message", chatMessage);
};
