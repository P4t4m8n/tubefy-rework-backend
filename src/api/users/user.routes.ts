import express from "express";
import { log } from "../../middlewares/logger.middleware";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserByEmail,
  getUserById,
  getUsers,
  updateUser,
} from "./user.controller";
import { requireAdmin, requireAuth } from "../../middlewares/auth.middleware";

export const userRoutes = express.Router();

userRoutes.get("/admin/:id", requireAuth, requireAdmin, log, getUserById);
userRoutes.get("/",log,getUsers)
userRoutes.get("/:email", log, getUserByEmail);
userRoutes.put("/:id", requireAuth, log, updateUser);
userRoutes.delete("/:id", requireAuth, log, deleteUser);
userRoutes.get("/all", requireAuth, requireAdmin, log, getAllUsers);
