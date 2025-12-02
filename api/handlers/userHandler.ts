import { Server, Socket } from "socket.io";

type OnlineUser = { socketId: string; userId: string; name: string; roomId: string };
export let onlineUsers: OnlineUser[] = [];

export const userHandler = (io: Server, socket: Socket) => {
    const newUser = (payload: { userId: string; name: string; roomId: string }) => {
        const { userId, name, roomId } = payload;

        if (!userId || !roomId) return;

        socket.join(roomId);

        const existingUserIndex = onlineUsers.findIndex(
            (user) => user.socketId === socket.id
        );

        if (existingUserIndex !== -1) {
            onlineUsers[existingUserIndex] = { socketId: socket.id, userId, name, roomId };
        } else {
            onlineUsers.push({ socketId: socket.id, userId, name, roomId });
        }

        const roomUsers = onlineUsers.filter(u => u.roomId === roomId);
        io.to(roomId).emit("usersOnline", roomUsers);

        console.log(`User ${name} (${userId}) joined room ${roomId}`);
    };

    const disconnect = () => {
        const user = onlineUsers.find(u => u.socketId === socket.id);
        if (user) {
            onlineUsers = onlineUsers.filter(u => u.socketId !== socket.id);

            const roomUsers = onlineUsers.filter(u => u.roomId === user.roomId);
            io.to(user.roomId).emit("usersOnline", roomUsers);

            console.log(`User ${user.name} disconnected from room ${user.roomId}`);
        }
    };

    socket.on("newUser", newUser);
    socket.on("disconnect", disconnect);
};
