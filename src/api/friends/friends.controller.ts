import { Request, Response } from "express";
import { FriendService } from "./friends.service";
import { asyncLocalStorage } from "../../middlewares/setupALs.middleware";
import { loggerService } from "../../services/logger.service";
import { FriendStatus } from "@prisma/client";
import { emit } from "process";
import { emitToUser } from "../../services/socket.service";
import { IFriend } from "./friends.model";

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
    const user = store?.loggedinUser;

    if (!user || !user?.id) {
      loggerService.error("Unauthorized to create friends", { friendId });
      return res.status(403).json({ message: "Unauthorized to get friends" });
    }
    const friend = await friendService.create(user.id, friendId);

    const socketDataFriend = {
      ...friend,
      friend: {
        username: user.username,
        imgUrl: user.imgUrl,
        id: user.id,
      },
    };

    emitToUser<IFriend>(friendId, "sendFriendRequest", socketDataFriend);

    res.json(friend);
  } catch (err) {
    loggerService.error("Failed to create friend", err as Error);
    res.status(500).send({ err: "Failed to create friend" });
  }
};

export const updateFriend = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const store = asyncLocalStorage.getStore();
    const user = store?.loggedinUser;
    const { status, friend } = req.body;

    if (!user || !user?.id) {
      loggerService.error("Unauthorized to update friend", { id });
      return res.status(403).send({ message: "Unauthorized to update friend" });
    }

    if (status === "REJECTED") {
      await friendService.remove(id);
      emitToUser(friend.id, "rejectFriendRequest", { id });
      res.status(204).send({ message: "Friend rejected" });
      return;
    }

    const updatedFriend = await friendService.update(id, status);

    const returnedFriend = {
      ...updatedFriend,
      friend,
    };

    if (status === "ACCEPTED") {
      emitToUser(friend.id, "approveFriendRequest", updatedFriend);
    }

    return res.json(returnedFriend);
  } catch (err) {
    loggerService.error("Failed to update friend", err as Error);
    res.status(500).send({ err: "Failed to update friend" });
  }
};
