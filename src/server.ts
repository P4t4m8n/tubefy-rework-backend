import { setupAsyncLocalStorage } from "./middlewares/setupALs.middleware";
import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
import cookieParser from "cookie-parser";
import { loggerService } from "./services/logger.service";
import dotenv from "dotenv";

dotenv.config();

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(cookieParser());
app.use(express.json());
app.use(setupAsyncLocalStorage)

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve("public")));
} else {
  // Use CORS in development
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

import { songRoutes } from "./api/songs/song.routes";
app.use("/api/song", songRoutes);


// Setup WebSocket

// Catch-all route
app.get("/**", (req: express.Request, res: express.Response) => {
  res.sendFile(path.resolve("public/index.html"));
});

const port = process.env.PORT || 3030;
server.listen(port, () => {
  loggerService.info("Server is running on port: " + port);
});
