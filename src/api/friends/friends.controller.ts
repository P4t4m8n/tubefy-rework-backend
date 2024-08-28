import { Request, Response } from "express";
import { FriendService } from "./friends.service";
import { asyncLocalStorage } from "../../middlewares/setupALs.middleware";
import { loggerService } from "../../services/logger.service";
import { FriendStatus } from "@prisma/client";

const friendService = new FriendService();

export const getFriends = async (req: Request, res: Response) => {
  try {
    const store = asyncLocalStorage.getStore();
    const userId = store?.loggedinUser?.id;

    const status = req.body.status as FriendStatus;

    if (!userId) {
      loggerService.error("Unauthorized to get friends", { userId });
      return res.status(403).json({ message: "Unauthorized to get friends" });
    }

    const friends = await friendService.query(userId, status);
    return res.json(friends);
  } catch (err) {
    res.status(500).send({ err: `Failed to get friends: ${err}` });
  }
};

export const getFriend = async (req: Request, res: Response) => {
  try {
    const { friendId } = req.params;
    const store = asyncLocalStorage.getStore();
    const userId = store?.loggedinUser?.id;

    if (!userId) {
      loggerService.error("Unauthorized to get friends", { userId });
      return res.status(403).json({ message: "Unauthorized to get friends" });
    }
    const friend = await friendService.get(userId, friendId);
    if (friend) {
      res.json(friend);
    } else {
      res.status(404).send({ err: `friend with id ${friendId} not found` });
    }
  } catch (err) {
    res.status(500).send({ err: "Failed to get friend" });
  }
};

export const createFriend = async (req: Request, res: Response) => {
  try {
    const { friendId } = req.body;
    const store = asyncLocalStorage.getStore();
    const userId = store?.loggedinUser?.id;

    if (!userId) {
      loggerService.error("Unauthorized to create friends", { userId });
      return res.status(403).json({ message: "Unauthorized to get friends" });
    }
    const isCreated = await friendService.create(userId, friendId);
    if (!isCreated) {
      loggerService.error("Friend already exists", { userId, friendId });
      return res.status(400).json({ message: "Friend already exists" });
    }
    res.json(isCreated);
  } catch (err) {
    loggerService.error("Failed to create friend", err as Error);
    res.status(500).send({ err: "Failed to create friend" });
  }
};

export const updateFriend = async (req: Request, res: Response) => {
  try {
    const { friendId } = req.params;
    const store = asyncLocalStorage.getStore();
    const userId = store?.loggedinUser?.id;
    const status = req.body.status as FriendStatus;

    if (!userId) {
      loggerService.error("Unauthorized to update friend", { userId });
      return res.status(403).json({ message: "Unauthorized to update friend" });
    }
    const isUpdated = await friendService.update(userId, friendId, status);
    if (!isUpdated) {
      loggerService.error(`Friend didn't update to status ${status}`, {
        userId,
        friendId,
      });
      return res.status(400).json({ message: "Friend didn't update" });
    }
  } catch (err) {
    loggerService.error("Failed to update friend", err as Error);
    res.status(500).send({ err: "Failed to update friend" });
  }
};
