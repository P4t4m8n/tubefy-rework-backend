import { setupAsyncLocalStorage } from "./middlewares/setupALs.middleware";
import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import http from "http";
import cookieParser from "cookie-parser";
import { loggerService } from "./services/logger.service";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(cookieParser());
app.use(express.json());
app.use(setupAsyncLocalStorage);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve("public")));
} else {
  const corsOptions: cors.CorsOptions = {
    origin: [
      "http://127.0.0.1:5173",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://localhost:3000",
      "http://127.0.0.1:8080",
      "http://localhost:8080",
    ],
    credentials: true,
  };
  app.use(cors(corsOptions));
}

// Routes
import { playlistRoutes } from "./api/playlists/playlist.routes";
app.use("/api/playlist", playlistRoutes);

import { authRoutes } from "./api/auth/auth.routes";
app.use("/api/auth", authRoutes);

import { songRoutes } from "./api/song/song.routes";
app.use("/api/song", songRoutes);

import { friendRoutes } from "./api/friends/friends.routes";
app.use("/api/friend", friendRoutes);

import { userRoutes } from "./api/users/user.routes";
app.use("/api/user", userRoutes);

import { notificationRoutes } from "./api/notification/notification.routes";
app.use("/api/notification", notificationRoutes);

// Setup WebSocket
import { setUpSocketAPI } from "./services/socket.service";
setUpSocketAPI(server);

// Catch-all route
app.get("/**", (req: Request, res: Response) => {
  res.sendFile(path.resolve("public/index.html"));
});

const port = process.env.PORT || 3030;
server.listen(port, () => {
  loggerService.info("Server is running on port: " + port);
});
