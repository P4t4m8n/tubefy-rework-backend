import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { log } from "../../middlewares/logger.middleware";
import { createSong, likeSong, unlikeSong } from "./song.controller";

export const songRoutes = express.Router();

songRoutes.post("/:id/like", requireAuth, log, likeSong);
songRoutes.delete("/:id/like", requireAuth, log, unlikeSong);
songRoutes.post("/edit", requireAuth, log, createSong);
