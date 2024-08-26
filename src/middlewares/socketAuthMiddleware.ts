import { Socket } from "socket.io";
import { authService } from "../api/auth/auth.service";

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
) => {
  const userId = socket.handshake.headers.cookie?.split("loginToken=")[1];

  if (!userId) {
    return next(new Error("You must be logged in"));
  }

  const session = await authService.validateToken(userId);
  if (!session) {
    return next(new Error("Invalid or expired session"));
  }

  socket.data.userId = session.id;
  next();
};
