import express from "express";
import {
  createFriend,
  getFriend,
  getFriends,
  removeFriend,
  updateFriend,
} from "./friends.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { log } from "../../middlewares/logger.middleware";

export const friendRoutes = express.Router();

friendRoutes.get("/", requireAuth, log, getFriends);
friendRoutes.get("/:friendId", requireAuth, log, getFriend);
friendRoutes.post("/", requireAuth, log, createFriend);
friendRoutes.put("/:id", requireAuth, log, updateFriend);
friendRoutes.delete("/:id", requireAuth, log, removeFriend);
