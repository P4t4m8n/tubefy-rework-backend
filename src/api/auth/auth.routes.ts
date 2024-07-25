import express from "express";
import { login, logout, signUp } from "./auth.controller";
import { log } from "../../middlewares/logger.middleware";
import { requireAuth } from "../../middlewares/auth.middleware";

const authRoutes = express.Router();

authRoutes.post("/signup", log, signUp);
authRoutes.post("/login", log, login);
authRoutes.post("/logout", requireAuth, log, logout);
