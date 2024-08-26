import { Server, Socket } from "socket.io";
import { socketAuthMiddleware } from "../middlewares/socketAuthMiddleware";
import http from "http";
import { loggerService } from "./logger.service";
import { PlaylistService } from "../api/playlists/playlist.service";

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
    const playlistService = new PlaylistService();
    console.info(`User connected [id: ${socket.id}, userId: ${userId}]`);
    loggerService.info(`User connected [id: ${socket.id}, userId: ${userId}]`);

    socket.on("disconnect", () => {
      console.info(`User disconnected [id: ${socket.id}]`);
      loggerService.info(`User disconnected [id: ${socket.id}]`);
    });

    socket.on(
      "sharePlaylist",
      async ({
        friendId,
        playlistId,
      }: {
        friendId: string;
        playlistId: string;
      }) => {
        const friendSocket = gIo.sockets.sockets.get(friendId);
        const playlist = await playlistService.getById(playlistId, friendId);
        friendSocket?.emit("sharedPlaylist", playlist);
      }
    );
  });
};
