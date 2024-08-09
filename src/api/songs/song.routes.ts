import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { log } from "../../middlewares/logger.middleware";
import { createSong, likeSong } from "./song.controller";

export const songRoutes = express.Router();

songRoutes.post("/like/create", requireAuth, log, likeSong);
songRoutes.delete("/like/delete", requireAuth, log, likeSong);
songRoutes.post("/edit", requireAuth, log, createSong);
