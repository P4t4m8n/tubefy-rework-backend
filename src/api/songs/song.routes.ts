import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { log } from "../../middlewares/logger.middleware";
import { toggleLikeSong } from "./song.controller";
import { setupAsyncLocalStorage } from "../../middlewares/setupALs.middleware";

export const songRoutes = express.Router();

// songRoutes.post("/", requireAuth, log, createSong);
// songRoutes.get("/:id", log, getSongById);
// songRoutes.get("/", log, getSongs);
// songRoutes.put("/:id", requireAuth, log, updateSong);
// songRoutes.delete("/:id", requireAuth, log, deleteSong);
songRoutes.post(
  "/like/:id",
  requireAuth,
  log,
  toggleLikeSong
);
