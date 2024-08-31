import { Request, Response, NextFunction } from "express";
import { AsyncLocalStorage } from "async_hooks";
import {  IUserDetailed } from "../api/users/user.model";
import { authService } from "../api/auth/auth.service";

export interface AsyncStorageData {
  loggedinUser?: IUserDetailed;
}

export const asyncLocalStorage = new AsyncLocalStorage<AsyncStorageData>();

export async function setupAsyncLocalStorage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const storage: AsyncStorageData = {};

  asyncLocalStorage.run(storage, async () => {
    if (!req.cookies) {
      return next();
    }

    const loginToken = req.cookies.loginToken;
    if (typeof loginToken !== "string") {
      return next();
    }

    const loggedinUser = await authService.validateToken(loginToken);

    if (loggedinUser) {
      const alsStore = asyncLocalStorage.getStore();
      if (alsStore) {
        alsStore.loggedinUser = loggedinUser;
      }
    }

    next();
  });
}
