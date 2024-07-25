import { Request, Response, NextFunction } from "express";
import { loggerService } from "../services/logger.service";
import { asyncLocalStorage } from "./setupALs.middleware";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const store = asyncLocalStorage.getStore();
  if (!store?.loggedinUser) {
    res.status(401).send("Not Authenticated");
    return;
  }

  next();
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const store = asyncLocalStorage.getStore();
  const loggedinUser = store?.loggedinUser;

  if (!loggedinUser) {
    res.status(401).send("Not Authenticated");
    return;
  }

  if (!loggedinUser.isAdmin) {
    loggerService.warn(
      `${loggedinUser.username} attempted to perform admin action`
    );
    res.status(403).send("Not Authorized");
    return;
  }

  next();
}
