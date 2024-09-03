import { Server, Socket } from "socket.io";
import { socketAuthMiddleware } from "../middlewares/socketAuthMiddleware";
import { loggerService } from "./logger.service";
import http from "http";
import { TSocketEvent } from "../models/socket.model";
import { IPlaylist } from "../api/playlists/playlist.model";
import { playlistService } from "../api/playlists/playlist.service";
let gIo: Server;
const connectedUsers = new Map<string, Socket>();

const createEventHandlers = (socket: Socket) =>
  new Map<TSocketEvent, (payload: any) => void>([
    [
      "joinPlaylist",
      async (payload: { playlistId: string }) => {
        socket.join(payload.playlistId);
      },
    ],
    [
      "leavePlaylist",
      async (payload: { playlistId: string }) => {
        socket.leave(payload.playlistId);
      },
    ],
  ]);

export const setUpSocketAPI = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) => {
  gIo = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  gIo.use(socketAuthMiddleware);

  gIo.on("connect", async (socket: Socket) => {
    const userId = socket.data.userId;
    connectedUsers.set(userId, socket);
    // const playlistsIds = await playlistService.fetchSharedPlaylistsId(userId);
    // playlistsIds.forEach((id) => {
    //   socket.join(id);
    // });
    console.info(`User connected [id: ${socket.id}, userId: ${userId}]`);

    // Register event handlers
    const eventHandlers = createEventHandlers(socket);
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, (payload) => handler(payload));
    });

    socket.on("disconnect", () => {
      connectedUsers.delete(userId);
      console.info(`User disconnected [id: ${socket.id}]`);
    });
  });
};

export const emitToUser = <T>(userId: string, event: TSocketEvent, data: T) => {
  const userSocket = connectedUsers.get(userId);
  if (!userSocket) {
    loggerService.warn(`User with id ${userId} not connected`);
    return;
  }
  userSocket.emit(event, data);
};
