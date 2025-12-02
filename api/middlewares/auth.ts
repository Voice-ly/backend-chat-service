import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

export const authMiddleware = (socket: Socket, next: (err?: any) => void) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
            (socket as any).user = decoded;
        } catch (err) {
            return next(new Error("Authentication error: Invalid token"));
        }
    }
    next();
};
