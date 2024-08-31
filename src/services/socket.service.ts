import { Server, Socket } from "socket.io";
import { socketAuthMiddleware } from "../middlewares/socketAuthMiddleware";
import { loggerService } from "./logger.service";
import { playlistService } from "../api/playlists/playlist.service";
import http from "http";
import { TSocketEvent } from "../models/socket.model";
import { IFriend } from "../api/friends/friends.model";

const connectedUsers = new Map<string, Socket>();

const eventHandlers: Record<TSocketEvent, (payload: any) => void> = {
  sharePlaylist: async ({
    friendId,
    playlistId,
  }: {
    friendId: string;
    playlistId: string;
  }) => {
    const friendSocket = connectedUsers.get(friendId);
    if (friendSocket) {
      const playlist = await playlistService.getById(playlistId, friendId);
      friendSocket.emit("sharePlaylist", playlist);
    }
  },
  sendFriendRequest: async ({
    friend,
    userId,
  }: {
    friend: IFriend;
    userId: string;
  }) => {
    const friendSocket = connectedUsers.get(userId);
    friendSocket?.emit("sendFriendRequest", friend);
  },
  rejectFriendRequest: async ({}) => {},
  approveFriendRequest: async ({ id }) => {},
};

export const setUpSocketAPI = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) => {
  const gIo = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  gIo.use(socketAuthMiddleware);

  gIo.on("connect", (socket: Socket) => {
    const userId = socket.data.userId;
    connectedUsers.set(userId, socket);
    console.info(`User connected [id: ${socket.id}, userId: ${userId}]`);

    // Register event handlers
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
    loggerService.info(`User with id ${userId} not connected`);
    return;
  }
  userSocket.emit(event, data);
};
