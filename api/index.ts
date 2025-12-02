import { Server, type Socket } from "socket.io";
import "dotenv/config";
import { authMiddleware } from "./middlewares/auth";
import { userHandler } from "./handlers/userHandler";
import { chatHandler } from "./handlers/chatHandler";

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

// Middleware
io.use(authMiddleware);

io.on("connection", (socket: Socket) => {
  console.log("A user connected with id: ", socket.id);

  // Handlers
  userHandler(io, socket);
  chatHandler(io, socket);
});
