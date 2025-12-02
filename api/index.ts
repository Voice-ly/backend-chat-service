import { Server, type Socket } from "socket.io";
import "dotenv/config";

const origins = (process.env.ORIGIN ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const io = new Server({
  cors: {
    origin: origins
  }
});

const port = Number(process.env.PORT);

io.listen(port);
console.log(`Server is running on port ${port}`);

type OnlineUser = { socketId: string; userId: string; name: string; roomId: string };
type ChatMessagePayload = {
  userId: string;
  message: string;
  timestamp?: string;
  name?: string;
  roomId: string;
};

let onlineUsers: OnlineUser[] = [];

io.on("connection", (socket: Socket) => {
  console.log("A user connected with id: ", socket.id);

  socket.on("newUser", (payload: { userId: string; name: string; roomId: string }) => {
    const { userId, name, roomId } = payload;

    if (!userId || !roomId) return;

    // Join the socket to the specific room
    socket.join(roomId);

    const existingUserIndex = onlineUsers.findIndex(
      (user) => user.socketId === socket.id
    );

    if (existingUserIndex !== -1) {
      onlineUsers[existingUserIndex] = { socketId: socket.id, userId, name, roomId };
    } else {
      onlineUsers.push({ socketId: socket.id, userId, name, roomId });
    }

    // Emit users online ONLY to the specific room
    const roomUsers = onlineUsers.filter(u => u.roomId === roomId);
    io.to(roomId).emit("usersOnline", roomUsers);

    console.log(`User ${name} (${userId}) joined room ${roomId}`);
  });

  socket.on("chat:message", (payload: ChatMessagePayload) => {
    const trimmedMessage = payload?.message?.trim();
    if (!trimmedMessage || !payload.roomId) return;

    const sender = onlineUsers.find((user) => user.socketId === socket.id) ?? null;

    const outgoingMessage = {
      userId: payload.userId || sender?.userId || socket.id,
      name: sender?.name || payload.name || "Unknown",
      message: trimmedMessage,
      timestamp: payload.timestamp ?? new Date().toISOString(),
      roomId: payload.roomId
    };

    // Broadcast message only to the specific room
    io.to(payload.roomId).emit("chat:message", outgoingMessage);

    console.log(
      `Message in room ${payload.roomId} from ${outgoingMessage.name}: ${outgoingMessage.message}`
    );
  });

  socket.on("disconnect", () => {
    const user = onlineUsers.find(u => u.socketId === socket.id);
    if (user) {
      onlineUsers = onlineUsers.filter(u => u.socketId !== socket.id);

      // Update users list for the room the user left
      const roomUsers = onlineUsers.filter(u => u.roomId === user.roomId);
      io.to(user.roomId).emit("usersOnline", roomUsers);

      console.log(`User ${user.name} disconnected from room ${user.roomId}`);
    }
  });
});











