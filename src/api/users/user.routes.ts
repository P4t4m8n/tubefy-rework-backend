import express from "express";
import { log } from "../../middlewares/logger.middleware";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserByEmail,
  getUserById,
  updateUser,
} from "./user.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

export const userRoutes = express.Router();

userRoutes.post("/", log, createUser);
userRoutes.get("/:id", log, getUserById);
userRoutes.get("/:email", log, getUserByEmail);
userRoutes.put("/:id", requireAuth, log, updateUser);
userRoutes.delete("/:id", requireAuth, log, deleteUser);
userRoutes.get("/", requireAuth, log, getAllUsers);
