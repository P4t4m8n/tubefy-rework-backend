import { Request, Response } from "express";
import { FriendService } from "./friends.service";
import { asyncLocalStorage } from "../../middlewares/setupALs.middleware";
import { loggerService } from "../../services/logger.service";
import { FriendStatus, NotificationType } from "@prisma/client";
import { emitToUser } from "../../services/socket.service";
import { IFriend } from "./friends.model";
import { notificationService } from "../notification/notification.service";
import {
  INotification,
  INotificationDTO,
} from "../notification/notification.model";
import { get } from "http";

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

    if (!user?.id) {
      loggerService.error("Unauthorized to create friends", { friendId });
      return res.status(403).json({ message: "Unauthorized to get friends" });
    }
    const friend = await friendService.create(user.id, friendId);

    const userNotificationPromise = createNotification({
      userId: user.id,
      fromUserId: friendId,
      type: "FRIEND_ADD",
      text: `You sent a friend request to ${user.username}`,
      friendId: friend.id,
    });

    const friendNotificationPromise = createNotification({
      userId: friendId,
      fromUserId: user.id,
      type: "FRIEND_REQUEST",
      text: `${user.username} sent you a friend request`,
      friendId: friend.id,
    }).then((notification) => ({
      //Flipping the user and friend in the notification
      ...notification,
      friend: {
        ...friend,
        friend: {
          username: user.username,
          imgUrl: user.imgUrl,
          id: user.id,
        },
      },
    }));

    const [userNotification, friendNotification] = await Promise.all([
      userNotificationPromise,
      friendNotificationPromise,
    ]);

    emitToUser<INotification>(
      friendId,
      "sendFriendRequest",
      friendNotification
    );

    res.status(200).json(userNotification);
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

    if (!user?.id) {
      loggerService.error("Unauthorized to update friend", { id });
      return res.status(403).send({ message: "Unauthorized to update friend" });
    }

    const updatedFriend = await friendService.update(id, status);
    const returnedFriend = { ...updatedFriend, friend };

    const userNotificationPromise = createNotification({
      userId: user.id,
      fromUserId: friend.id,
      type: getNotificationType(status),
      text: getUserNotificationText(status, friend.username),
      friendId: id,
    }).then((notification) => ({
      //Flipping the user and friend in the notification
      ...notification,
      friend: returnedFriend,
    }));

    const friendNotificationPromise = createNotification({
      userId: friend.id,
      fromUserId: user.id,
      type: getNotificationType(status),
      text: getFriendNotificationText(status, user.username),
      friendId: id,
    });

    const [userNotification, friendNotification] = await Promise.all([
      userNotificationPromise,
      friendNotificationPromise,
    ]);

    emitFriendStatusEvent(friend.id, status, friendNotification);

    return res.json(userNotification);
  } catch (err) {
    loggerService.error("Failed to update friend", err as Error);
    return res.status(500).send({ err: "Failed to update friend" });
  }
};

export const removeFriend = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { friendId } = req.body;

    const store = asyncLocalStorage.getStore();
    const user = store?.loggedinUser;

    if (!user?.id) {
      loggerService.error("Unauthorized to remove friend", { id });
      return res.status(403).send({ message: "Unauthorized to remove friend" });
    }

    const friend = await friendService.remove(id);

    const userNotificationPromise = createNotification({
      userId: user.id,
      fromUserId: friendId,
      type: getNotificationType("REMOVED"),
      text: getUserNotificationText("REMOVED", friend.friend.username),
    });

    const friendNotificationPromise = createNotification({
      userId: friendId,
      fromUserId: user.id,
      type: "FRIEND_REMOVED",
      text: getFriendNotificationText("REMOVED", user.username),
    }).then((notification) => ({
      //Flipping the user and friend in the notification
      ...notification,
      fromUser: {
        id: user.id,
        username: user.username,
        imgUrl: user.imgUrl,
      },
      friend,
    }));

    const [userNotification, friendNotification] = await Promise.all([
      userNotificationPromise,
      friendNotificationPromise,
    ]);

    emitToUser<INotification>(
      friendId,
      "removeFriendRequest",
      friendNotification
    );

    return res.json(userNotification);
  } catch (err) {
    loggerService.error("Failed to remove friend", err as Error);
    res.status(500).send({ err: "Failed to remove friend" });
  }
};

// Helper functions
const createNotification = async (data: INotificationDTO) => {
  return await notificationService.create(data);
};

const getNotificationType = (status: FriendStatus): NotificationType => {
  switch (status) {
    case "ACCEPTED":
      return "FRIEND_ACCEPTED";
    case "REJECTED":
      return "FRIEND_REJECTED";
    case "BLOCKED":
      return "FRIEND_BLOCKED";
    case "REMOVED":
      return "FRIEND_REMOVED";
    default:
      return "GENERAL_ERROR";
  }
};

const getUserNotificationText = (
  status: FriendStatus,
  friendUsername: string
) => {
  switch (status) {
    case "ACCEPTED":
      return `You accepted ${friendUsername}'s friend request`;
    case "REJECTED":
      return `You rejected ${friendUsername}'s friend request`;
    case "BLOCKED":
      return `You blocked ${friendUsername}`;
    case "REMOVED":
      return `You removed ${friendUsername}`;
    default:
      return `No status found for friend request`;
  }
};

const getFriendNotificationText = (status: string, userUsername: string) => {
  switch (status) {
    case "ACCEPTED":
      return `${userUsername} accepted your friend request`;
    case "REJECTED":
      return `${userUsername} rejected your friend request`;
    case "BLOCKED":
      return `${userUsername} blocked you`;
    case "REMOVED":
      return `${userUsername} removed you`;
    default:
      return `No status found for friend request`;
  }
};

const emitFriendStatusEvent = (
  friendId: string,
  status: string,
  notification: any
) => {
  switch (status) {
    case "ACCEPTED":
      emitToUser(friendId, "approveFriendRequest", notification);
      break;
    case "REJECTED":
      emitToUser(friendId, "rejectFriendRequest", notification);
      break;
    case "BLOCKED":
      emitToUser(friendId, "blockFriendRequest", notification);
      break;
    default:
      break;
  }
};
