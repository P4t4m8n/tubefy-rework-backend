import express from "express";
import { log } from "../../middlewares/logger.middleware";
import { requireAuth } from "../../middlewares/auth.middleware";

export const notificationRoutes = express.Router();


notificationRoutes.delete("/:id", requireAuth, log, logout);
