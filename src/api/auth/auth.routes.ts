import express from "express";
import { login, logout, signUp } from "./auth.controller";
import { log } from "../../middlewares/logger.middleware";
import { requireAuth } from "../../middlewares/auth.middleware";
import { setupAsyncLocalStorage } from "../../middlewares/setupALs.middleware";

export const authRoutes = express.Router();

authRoutes.post("/signup", log, signUp);
authRoutes.post("/login", log, login);
authRoutes.post("/logout",setupAsyncLocalStorage, requireAuth, log, logout);
