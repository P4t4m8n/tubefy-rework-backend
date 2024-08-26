import express from "express";
import {
  createFriend,
  getFriend,
  getFriends,
  updateFriend,
} from "./friends.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { log } from "../../middlewares/logger.middleware";

export const friendRoutes = express.Router();

friendRoutes.get("/", requireAuth, log, getFriends);
friendRoutes.get("/:friendId", requireAuth, log, getFriend);
friendRoutes.post("/:friendId", requireAuth, log, createFriend);
friendRoutes.put("/:friendId", requireAuth, log, updateFriend);
